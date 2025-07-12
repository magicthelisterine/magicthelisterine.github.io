# 🧩 Google Sheets + Drive API – CRUD + Upload d’images

Ce projet utilise **Google Apps Script** pour transformer **deux feuilles Google Sheets** en une **API REST gratuite** :

- ✅ Feuille `Data` pour stocker et gérer des données
- 🖼️ Feuille `Images` pour uploader des fichiers image vers Google Drive et les lier à des `uuid`

---

## ✨ Fonctionnalités

### 📄 Feuille `Data`
| Action    | Méthode | Endpoint                     | Description                            |
|-----------|---------|------------------------------|----------------------------------------|
| `add`     | `POST`  | `/exec`                      | Ajouter une ligne                      |
| `update`  | `POST`  | `/exec`                      | Modifier une ligne (via `uuid`)        |
| `delete`  | `POST`  | `/exec`                      | Supprimer une ligne (via `uuid`)       |
| `get`     | `GET`   | `/exec?uuid=TON_UUID`        | Obtenir une ligne spécifique           |
| `get_all` | `GET`   | `/exec`                      | Obtenir toutes les lignes              |

### 🖼️ Feuille `Images`
| Action     | Méthode | Endpoint                    | Description                              |
|------------|---------|-----------------------------|------------------------------------------|
| `upload`   | `POST`  | `/exec`                     | Uploader une image liée à un `uuid`      |
| `get`      | `GET`   | `/exec?uuid=TON_UUID`       | Obtenir toutes les images pour un `uuid` |
| `get_all`  | `GET`   | `/exec`                     | Obtenir toutes les images                |

---

## 📋 Installation

### 1. Créer une Google Sheet

- Onglet 1 : `Data`
- Onglet 2 : `Images`

#### 🟢 Feuille `Data` – En-têtes :
```
uuid | createdAt | lastModifiedAt | nom | ville | métier
```

#### 🖼️ Feuille `Images` – En-têtes :
```
timestamp | uuid | filename | url
```

---

### 2. Ouvrir l’éditeur Apps Script

- `Extensions > Apps Script`
- Supprimer tout et coller ce code :

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // 🎯 Upload image vers Drive
  if (data.image && data.uuid) {
    const filename = data.filename || "image_" + Date.now() + ".jpg";
    const contentType = data.image.match(/^data:(.+);base64,/)[1];
    const rawData = data.image.replace(/^data:.+;base64,/, "");
    const blob = Utilities.newBlob(Utilities.base64Decode(rawData), contentType, filename);

    const folder = getOrCreateFolder("ImagesUpload");
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Images");
    sheet.appendRow([new Date(), data.uuid, filename, fileUrl]);

    return respond({ status: "success", uuid: data.uuid, url: fileUrl });
  }

  // ✍️ Gestion des données
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  const action = data.action;
  const values = sheet.getDataRange().getValues();

  if (action === "add") {
    const uuid = Utilities.getUuid();
    const timestamp = new Date().toISOString();
    const row = [uuid, timestamp, timestamp, ...data.values];
    sheet.appendRow(row);
    return respond({ status: "success", action, uuid });
  }

  if (action === "update") {
    const uuid = data.id;
    const newValues = data.values;
    const modified = new Date().toISOString();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === uuid) {
        sheet.getRange(i + 1, 3).setValue(modified);
        sheet.getRange(i + 1, 4, 1, newValues.length).setValues([newValues]);
        return respond({ status: "success", action, uuid });
      }
    }
    return respond({ status: "error", message: "UUID not found", action });
  }

  if (action === "delete") {
    const uuid = data.id;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === uuid) {
        sheet.deleteRow(i + 1);
        return respond({ status: "success", action, uuid });
      }
    }
    return respond({ status: "error", message: "UUID not found", action });
  }

  return respond({ status: "error", message: "Invalid action" });
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (ss.getSheetByName("Images") && (!ss.getSheetByName("Data") || e.parameter.uuid && !e.parameter.action)) {
    const sheet = ss.getSheetByName("Images");
    const data = sheet.getDataRange().getValues();
    const headers = ["timestamp", "uuid", "filename", "url"];
    const uuidFilter = e.parameter.uuid;

    const rows = data.slice(1).filter(row => !uuidFilter || row[1] === uuidFilter).map(row => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = row[i];
      }
      return obj;
    });

    return respond({ status: "success", count: rows.length, rows });
  }

  const sheet = ss.getSheetByName("Data");
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h, i) => {
    if (i === 0) return "uuid";
    if (i === 1) return "createdAt";
    if (i === 2) return "lastModifiedAt";
    return h;
  });

  const uuid = e.parameter.uuid;

  const rows = data.slice(1).filter(row => !uuid || row[0] === uuid).map((row, index) => {
    const obj = {
      uuid: row[0],
      createdAt: row[1],
      lastModifiedAt: row[2],
      rowIndex: index + 2
    };
    for (let j = 3; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    return obj;
  });

  if (uuid && rows.length === 0) {
    return respond({ status: "error", message: "UUID not found" });
  }

  return uuid
    ? respond({ status: "success", row: rows[0] })
    : respond({ status: "success", count: rows.length, rows });
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
```

---

## 🚀 Déployer comme application web

1. Cliquez sur **Déployer > Déployer comme application web**
2. Paramètres :
   - Exécuter en tant que : **vous-même**
   - Accès : **Toute personne**
3. Autorisez les accès
4. Copiez l’URL d’API générée

---

## 🧪 Exemples JavaScript

```js
// Ajouter
fetch("https://script.google.com/macros/s/TON_ID/exec", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "add",
    values: ["Jean", "Montréal", "Boulanger"]
  })
});
```

```js
// Modifier
fetch("https://script.google.com/macros/s/TON_ID/exec", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "update",
    id: "UUID_REÇU",
    values: ["Jean", "Laval", "Chef"]
  })
});
```

```js
// Supprimer
fetch("https://script.google.com/macros/s/TON_ID/exec", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "delete",
    id: "UUID_REÇU"
  })
});
```

```js
// Get all
fetch("https://script.google.com/macros/s/TON_ID/exec")
  .then(res => res.json()).then(console.log);
```

```js
// Get one
fetch("https://script.google.com/macros/s/TON_ID/exec?uuid=UUID_REÇU")
  .then(res => res.json()).then(console.log);
```

---

## 🖼️ Upload image liée à UUID

```html
<input type="file" id="fileInput">
<input type="text" id="uuidInput" placeholder="UUID">
<button onclick="uploadImage()">Uploader</button>

<script>
function uploadImage() {
  const file = document.getElementById("fileInput").files[0];
  const uuid = document.getElementById("uuidInput").value;
  if (!file || !uuid) return alert("UUID et image requis");

  const reader = new FileReader();
  reader.onload = function(e) {
    fetch("https://script.google.com/macros/s/TON_ID/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uuid: uuid,
        filename: file.name,
        image: e.target.result
      })
    }).then(r => r.json()).then(console.log);
  };
  reader.readAsDataURL(file);
}
</script>
```

---

