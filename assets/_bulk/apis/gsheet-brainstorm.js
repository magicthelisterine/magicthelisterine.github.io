function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Data");
  const headers = sheet.getDataRange().getValues()[0];
  const allRows = sheet.getDataRange().getValues();
  const action = data.action;

  // 📸 Upload image avec nom unique
  if (data.image && !action && data.filename) {
    const folder = getOrCreateFolder("ImagesUpload");
    const originalName = data.filename;
    const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
    const base = originalName.replace(/\.[^/.]+$/, '');
    let filename = originalName;
    let counter = 1;

    while (folder.getFilesByName(filename).hasNext()) {
      filename = base + '-' + counter + (ext ? '.' + ext : '');
      counter++;
    }

    const contentType = data.image.match(/^data:(.+);base64,/)[1];
    const rawData = data.image.replace(/^data:.+;base64,/, "");
    const blob = Utilities.newBlob(Utilities.base64Decode(rawData), contentType, filename);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = file.getUrl();

    const imageSheet = ss.getSheetByName("Images");
    const image_uuid = Utilities.getUuid();
    const createdAt = new Date().toISOString();

    imageSheet.appendRow([image_uuid, createdAt, filename, url]);
    return respond({ status: "success", image_uuid, filename, url });
  }

  if (action === "delete_image") {
    const uuid = data.id;
    const imageSheet = ss.getSheetByName("Images");
    const rows = imageSheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === uuid) {
        const url = rows[i][3];
        const fileId = url.match(/[-\w]{25,}/)?.[0];
        if (fileId) {
          try { DriveApp.getFileById(fileId).setTrashed(true); } catch (e) {}
        }
        imageSheet.deleteRow(i + 1);
        return respond({ status: "success", deleted: uuid });
      }
    }
    return respond({ status: "error", message: "Image UUID not found" });
  }

  if (action === "add") {
    const uuid = Utilities.getUuid();
    const now = new Date().toISOString();
    const row = new Array(headers.length).fill("");
    row[0] = uuid;
    row[1] = now;
    row[2] = now;
    for (let key in data.values) {
      const idx = headers.indexOf(key);
      if (idx !== -1) row[idx] = data.values[key];
    }
    sheet.appendRow(row);
    return respond({ status: "success", action, uuid });
  }

  if (action === "update") {
    const uuid = data.id;
    const rowIndex = allRows.findIndex((r, i) => i > 0 && r[0] === uuid);
    if (rowIndex === -1) return respond({ status: "error", message: "UUID not found" });

    sheet.getRange(rowIndex + 1, 3).setValue(new Date().toISOString());
    for (let key in data.values) {
      const idx = headers.indexOf(key);
      if (idx !== -1) sheet.getRange(rowIndex + 1, idx + 1).setValue(data.values[key]);
    }
    return respond({ status: "success", action, uuid });
  }

  if (action === "delete") {
    const uuid = data.id;
    const rowIndex = allRows.findIndex((r, i) => i > 0 && r[0] === uuid);
    if (rowIndex === -1) return respond({ status: "error", message: "UUID not found" });

    sheet.deleteRow(rowIndex + 1);
    return respond({ status: "success", action, uuid });
  }

  return respond({ status: "error", message: "Invalid action" });
}

function doGet(e) {
  if (!e || !e.parameter) return respond({ status: "error", message: "No parameters provided" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // GET /?images=true → retourne toutes les images
  if (e.parameter.images === "true") {
    const sheet = ss.getSheetByName("Images");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    return respond({ status: "success", count: rows.length, images: rows });
  }

  // GET /?image_uuid=... → retourne une seule image
  if (e.parameter.image_uuid) {
    const sheet = ss.getSheetByName("Images");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === e.parameter.image_uuid) {
        const obj = {};
        headers.forEach((h, j) => obj[h] = data[i][j]);
        return respond({ status: "success", image: obj });
      }
    }
    return respond({ status: "error", message: "Image UUID not found" });
  }

  // GET / ou /?uuid=... → retourne un ou tous les rows de Data, avec image jointe
  const dataSheet = ss.getSheetByName("Data");
  const imageSheet = ss.getSheetByName("Images");
  const imageData = imageSheet.getDataRange().getValues();
  const imageHeaders = imageData[0];
  const imageMap = {};
  for (let i = 1; i < imageData.length; i++) {
    const obj = {};
    imageHeaders.forEach((h, j) => obj[h] = imageData[i][j]);
    imageMap[imageData[i][0]] = obj;
  }

  const data = dataSheet.getDataRange().getValues();
  const headers = data[0];
  const uuid = e.parameter.uuid;

  const rows = data.slice(1).filter(row => !uuid || row[0] === uuid).map((row, index) => {
    const obj = { rowIndex: index + 2 };
    headers.forEach((h, i) => obj[h] = row[i]);
    const imageUUID = obj.image_uuid;
    obj.image = imageMap[imageUUID] || null;
    return obj;
  });

  const canEdit = userCanEdit(dataSheet);

  if (uuid && rows.length === 0) return respond({ status: "error", message: "UUID not found" });

  return uuid
    ? respond({ status: "success", row: rows[0], canEdit })
    : respond({ status: "success", count: rows.length, rows, canEdit });
}

// 🔐 Vérifie si l'utilisateur a les droits d'édition sur la feuille
function userCanEdit(sheet) {
  const editors = sheet.getEditors().map(e => e.getEmail());
  const currentUser = Session.getEffectiveUser().getEmail();
  return editors.includes(currentUser);
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
