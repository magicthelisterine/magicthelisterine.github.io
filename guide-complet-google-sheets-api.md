# 📦 Google Sheets + Drive comme API REST — Guide Complet (Apps Script + JS Pur)

Ce guide couvre **l’intégralité** du projet :
✅ API REST sans backend  
✅ Upload d’images dans Google Drive  
✅ Stockage de données dans Google Sheets  
✅ Frontend JavaScript pur (aucune librairie externe)

---

## 📦 Google Sheets + Drive comme API REST — Guide Complet (Apps Script + JS Pur)

Ce guide couvre **l’intégralité** du projet :
✅ API REST sans backend  
✅ Upload d’images dans Google Drive  
✅ Stockage de données dans Google Sheets  
✅ Frontend JavaScript pur (aucune librairie externe)

---

## 🛠️ Code complet — Google Apps Script

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Data");
  const headers = sheet.getDataRange().getValues()[0];
  const allRows = sheet.getDataRange().getValues();
  const action = data.action;

  if (data.image && !action && data.filename) {
    const filename = data.filename;
    const contentType = data.image.match(/^data:(.+);base64,/)[1];
    const rawData = data.image.replace(/^data:.+;base64,/, "");
    const blob = Utilities.newBlob(Utilities.base64Decode(rawData), contentType, filename);

    const folder = getOrCreateFolder("ImagesUpload");
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();

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

  const sheet = ss.getSheetByName("Data");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uuid = e.parameter.uuid;
  const rows = data.slice(1).filter(row => !uuid || row[0] === uuid).map((row, index) => {
    const obj = { rowIndex: index + 2 };
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });

  if (uuid && rows.length === 0) return respond({ status: "error", message: "UUID not found" });
  return uuid
    ? respond({ status: "success", row: rows[0] })
    : respond({ status: "success", count: rows.length, rows });
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
```

---

## 🧪 Exemples JS pour chaque action (vanilla)

Voir [réponse précédente] pour les méthodes JS :
- `add`, `update`, `delete`
- `uploadImage`, `deleteImage`
- `getAll`, `getByUUID`
- `getAllImages`, `getImageByUUID`

---

#
---

## 💻 JavaScript pur — Exemples d’utilisation pour chaque action

```js
const API_URL = "https://script.google.com/macros/s/TON_ID/exec";
```

### ➕ Ajouter une ligne

```js
fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "add",
    values: {
      nom: "Alice",
      ville: "Laval",
      métier: "Designer"
    }
  })
});
```

### 📝 Modifier une ligne

```js
fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "update",
    id: "UUID_LIGNE",
    values: {
      nom: "Nouveau nom",
      ville: "Nouvelle ville",
      métier: "Nouveau métier"
    }
  })
})
  .then(r => r.json())
  .then(console.log);
```
### 🗑️ Supprimer une ligne

```js
fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "delete",
    id: "UUID_LIGNE"
  })
});
```

### 📄 Obtenir toutes les lignes

```js
fetch(API_URL)
  .then(r => r.json())
  .then(console.log);
```

### 🔍 Obtenir une ligne spécifique

```js
fetch(API_URL + "?uuid=UUID_LIGNE")
  .then(r => r.json())
  .then(console.log);
```

### 🖼️ Uploader une image

```js
async function uploadImage(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, image: base64 })
    });
    const data = await res.json();
    console.log("image uuid:", data.image_uuid);
  };
  reader.readAsDataURL(file);
}
```

### 🗑️ Supprimer une image

```js
fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "delete_image", id: "UUID_IMAGE" })
});
```

### 🖼️ Obtenir toutes les images

```js
fetch(API_URL + "?images=true")
  .then(r => r.json())
  .then(console.log);
```

### 🖼️ Obtenir une image spécifique

```js
fetch(API_URL + "?image_uuid=UUID_IMAGE")
  .then(r => r.json())
  .then(console.log);
```

---

# 🧠 Auteur

Maxime Larrivée-Roy — juillet 2025  