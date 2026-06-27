/**
 * SMART NOTES MANAGEMENT SYSTEM - GOOGLE APPS SCRIPT BRIDGE API
 * Enterprise Grade Web App REST Bridge
 * 
 * Handles:
 * - CRUD (Read, Insert, Update, Delete) across 15 tables/sheets
 * - Pagination (page, limit)
 * - Filtering & Sorting (sortBy, sortOrder)
 * - Real-time Search across text fields
 * - Google Drive File Upload & Public URL generation
 * - JSON Response format with standardized structure
 */

const SCRIPT_PROP = PropertiesService.getScriptProperties();

// ============================================================================
// KONFIGURASI ID SPREADSHEET & DRIVE FOLDER
// ============================================================================
// 1. Jika skrip ini dibuat dari menu Extensions > Apps Script di dalam Spreadsheet Anda, biarkan kosong ("").
// 2. Jika skrip ini dibuat terpisah (Standalone di script.google.com), masukkan ID Spreadsheet Anda di bawah ini.
//    Cara dapat ID Spreadsheet: Dari URL https://docs.google.com/spreadsheets/d/ID_SPREADSHEET_DI_SINI/edit
const SPREADSHEET_ID = SCRIPT_PROP.getProperty("SPREADSHEET_ID") || "";

// ID Folder Google Drive untuk menyimpan lampiran rapat/file upload (kosongkan/"root" untuk folder utama)
const DEFAULT_DRIVE_FOLDER_ID = SCRIPT_PROP.getProperty("DRIVE_FOLDER_ID") || "root";
// ============================================================================

/**
 * Helper mendapatkan objek Spreadsheet yang aktif atau berdasarkan ID
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  const activeSs = SpreadsheetApp.getActiveSpreadsheet();
  if (!activeSs) {
    throw new Error("Skrip tidak terhubung ke Spreadsheet. Silakan isi variabel SPREADSHEET_ID di baris 20 Code.gs!");
  }
  return activeSs;
}

/**
 * Handle HTTP GET Requests (Read, Search, Pagination, Filtering)
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action || "read";
    const sheetName = params.sheet;

    if (!sheetName && action !== "ping") {
      return makeJsonResponse(400, "Error: Parameter 'sheet' wajib diisi.", null);
    }

    if (action === "ping") {
      return makeJsonResponse(200, "Pong! Smart Notes GAS Bridge is active.", { timestamp: new Date().toISOString() });
    }

    if (action === "read") {
      const data = getSheetData(sheetName, params);
      return makeJsonResponse(200, "Success fetching data", data);
    }

    if (action === "getById") {
      const id = params.id;
      if (!id) return makeJsonResponse(400, "Error: Parameter 'id' wajib diisi.", null);
      const item = getById(sheetName, id);
      if (!item) return makeJsonResponse(404, "Data tidak ditemukan", null);
      return makeJsonResponse(200, "Success fetching detail", item);
    }

    // Parse data jika dikirim sebagai string JSON di parameter GET
    let dataObj = params.data;
    if (typeof dataObj === "string") {
      try { dataObj = JSON.parse(dataObj); } catch(err) {}
    }

    if (action === "insert") {
      const newItem = insertData(sheetName, dataObj || params);
      return makeJsonResponse(201, "Data berhasil ditambahkan", newItem);
    }

    if (action === "update") {
      const updatedItem = updateData(sheetName, params.id, dataObj || params);
      if (!updatedItem) return makeJsonResponse(404, "ID tidak ditemukan untuk diupdate", null);
      return makeJsonResponse(200, "Data berhasil diperbarui", updatedItem);
    }

    if (action === "delete") {
      const isDeleted = deleteData(sheetName, params.id);
      if (!isDeleted) return makeJsonResponse(404, "ID tidak ditemukan untuk dihapus", null);
      return makeJsonResponse(200, "Data berhasil dihapus", { id: params.id });
    }

    return makeJsonResponse(400, "Invalid action for GET", null);
  } catch (err) {
    return makeJsonResponse(500, "Server Error: " + err.toString(), null);
  }
}

/**
 * Handle HTTP POST Requests (Insert, Update, Delete, Upload)
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action;
    const sheetName = payload.sheet;

    if (action === "upload") {
      const uploadResult = uploadToDrive(payload.base64Data, payload.fileName, payload.mimeType, payload.folderId);
      return makeJsonResponse(200, "File berhasil diupload", uploadResult);
    }

    if (action === "deleteFile") {
      const deleteResult = deleteFromDrive(payload.fileId);
      return makeJsonResponse(200, "File berhasil dihapus dari Drive", deleteResult);
    }

    if (!sheetName) {
      return makeJsonResponse(400, "Error: Parameter 'sheet' wajib diisi untuk operasi DB.", null);
    }

    if (action === "insert") {
      const newItem = insertData(sheetName, payload.data);
      return makeJsonResponse(201, "Data berhasil ditambahkan", newItem);
    }

    if (action === "update") {
      const updatedItem = updateData(sheetName, payload.id, payload.data);
      if (!updatedItem) return makeJsonResponse(404, "ID tidak ditemukan untuk diupdate", null);
      return makeJsonResponse(200, "Data berhasil diperbarui", updatedItem);
    }

    if (action === "delete") {
      const isDeleted = deleteData(sheetName, payload.id);
      if (!isDeleted) return makeJsonResponse(404, "ID tidak ditemukan untuk dihapus", null);
      return makeJsonResponse(200, "Data berhasil dihapus", { id: payload.id });
    }

    return makeJsonResponse(400, "Invalid action for POST", null);
  } catch (err) {
    return makeJsonResponse(500, "Server Error: " + err.toString(), null);
  }
}

/**
 * Helper: Mengambil data dari sheet dengan pagination, sorting, search, filter
 */
function getSheetData(sheetName, params) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { items: [], total: 0, page: 1, limit: 100 };

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { items: [], total: 0, page: 1, limit: 100 };

  const headers = values[0];
  let rows = values.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });

  // 1. Filtering (key=value)
  if (params.filterKey && params.filterValue) {
    rows = rows.filter(r => String(r[params.filterKey]).toLowerCase() === String(params.filterValue).toLowerCase());
  }

  // 2. Search
  if (params.search && params.search.trim() !== "") {
    const query = params.search.toLowerCase().trim();
    rows = rows.filter(r => {
      return Object.values(r).some(val => String(val).toLowerCase().includes(query));
    });
  }

  // 3. Sorting
  if (params.sortBy) {
    const order = (params.sortOrder && params.sortOrder.toLowerCase() === "desc") ? -1 : 1;
    rows.sort((a, b) => {
      let valA = a[params.sortBy] || "";
      let valB = b[params.sortBy] || "";
      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });
  }

  const total = rows.length;
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 100; // default 100 items per page
  const startIndex = (page - 1) * limit;
  const paginatedRows = rows.slice(startIndex, startIndex + limit);

  return {
    items: paginatedRows,
    total: total,
    page: page,
    limit: limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Helper: Ambil item berdasarkan ID
 */
function getById(sheetName, id) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;

  const headers = values[0];
  const idIndex = headers.indexOf("id");
  if (idIndex === -1) return null;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(id)) {
      let obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[i][idx];
      });
      return obj;
    }
  }
  return null;
}

// ============================================================================
// LOCK SERVICE & SHEET PROTECTION HELPERS
// ============================================================================
function getScriptLock() {
  const lock = LockService.getScriptLock();
  // Menunggu hingga 30 detik untuk mendapatkan kunci akses menulis
  const hasLock = lock.tryLock(30000);
  if (!hasLock) {
    throw new Error("Gagal memperoleh Lock script setelah 30 detik. Antrean penuh.");
  }
  return lock;
}

function protectSheetStructure(sheet) {
  try {
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    let isProtected = false;
    for (let i = 0; i < protections.length; i++) {
      if (protections[i].getDescription() === "Header & ID Protection") {
        isProtected = true;
        break;
      }
    }
    
    // Lindungi Header di baris 1 jika belum diproteksi
    if (!isProtected && sheet.getLastRow() > 0 && sheet.getLastColumn() > 0) {
      const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
      const protection = headerRange.protect().setDescription("Header & ID Protection");
      
      // Hanya izinkan pemilik/script executor yang mengedit
      const me = Session.getActiveUser().getEmail();
      if (me) {
        protection.addEditor(me);
        protection.removeEditors(protection.getEditors());
        if (protection.canDomainEdit()) {
          protection.setDomainEdit(false);
        }
      }
    }
  } catch (err) {
    Logger.log("Gagal mengaktifkan Sheet Protection: " + err.toString());
  }
}
// ============================================================================

/**
 * Helper: Insert baris baru dengan Lock & Protection
 */
function insertData(sheetName, dataObj) {
  const lock = getScriptLock();
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    let headers = [];
    if (sheet.getLastRow() === 0) {
      headers = Object.keys(dataObj);
      if (!headers.includes("id")) headers.unshift("id");
      if (!headers.includes("created_at")) headers.push("created_at");
      sheet.appendRow(headers);
    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      // Deteksi dan tambahkan header baru secara dinamis jika dikirim dari frontend
      let hasNewHeaders = false;
      Object.keys(dataObj).forEach(function(key) {
        if (!headers.includes(key)) {
          headers.push(key);
          hasNewHeaders = true;
        }
      });
      if (hasNewHeaders) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }

    if (!dataObj.id) {
      dataObj.id = "ID-" + new Date().getTime() + "-" + Math.floor(Math.random()*1000);
    }
    if (!dataObj.created_at) {
      dataObj.created_at = new Date().toISOString();
    }

    const newRow = headers.map(h => {
      return dataObj[h] !== undefined ? dataObj[h] : "";
    });

    sheet.appendRow(newRow);
    protectSheetStructure(sheet);
    return dataObj;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper: Update baris berdasarkan ID dengan Lock & Protection
 */
function updateData(sheetName, id, updateObj) {
  const lock = getScriptLock();
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return null;

    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) return null;

    let headers = values[0];
    const idIndex = headers.indexOf("id");
    if (idIndex === -1) return null;

    // Deteksi dan tambahkan header baru secara dinamis jika ada property baru saat update
    let hasNewHeaders = false;
    Object.keys(updateObj).forEach(function(key) {
      if (!headers.includes(key)) {
        headers.push(key);
        hasNewHeaders = true;
      }
    });
    if (hasNewHeaders) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      for (let r = 1; r < values.length; r++) {
        while (values[r].length < headers.length) {
          values[r].push("");
        }
      }
    }

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idIndex]) === String(id)) {
        updateObj.updated_at = new Date().toISOString();
        let updatedRow = values[i].map((oldVal, colIdx) => {
          const headerName = headers[colIdx];
          if (updateObj[headerName] !== undefined) {
            return updateObj[headerName];
          }
          return oldVal;
        });

        sheet.getRange(i + 1, 1, 1, headers.length).setValues([updatedRow]);
        protectSheetStructure(sheet);
        
        let res = {};
        headers.forEach((h, idx) => res[h] = updatedRow[idx]);
        return res;
      }
    }
    return null;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper: Delete baris berdasarkan ID dengan Lock
 */
function deleteData(sheetName, id) {
  const lock = getScriptLock();
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return false;

    const values = sheet.getDataRange().getValues();
    const idIndex = values[0].indexOf("id");
    if (idIndex === -1) return false;

    for (let i = 1; i < values.length; i++) {
      if (String(values[i][idIndex]) === String(id)) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Helper: Upload file Base64 ke Google Drive
 */
function uploadToDrive(base64Data, fileName, mimeType, folderId) {
  try {
    const targetFolderId = folderId && folderId !== "root" ? folderId : DEFAULT_DRIVE_FOLDER_ID;
    let folder;
    try {
      folder = DriveApp.getFolderById(targetFolderId);
    } catch (e) {
      folder = DriveApp.getRootFolder();
    }

    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, mimeType || "application/octet-stream", fileName || "attachment.bin");
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      fileId: file.getId(),
      fileName: file.getName(),
      mimeType: file.getMimeType(),
      size: file.getSize(),
      url: file.getUrl(),
      downloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId()
    };
  } catch (err) {
    throw new Error("Gagal upload ke Drive: " + err.toString());
  }
}

/**
 * Helper: Delete file dari Google Drive
 */
function deleteFromDrive(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

/**
 * Helper: Format standar output JSON response
 */
function makeJsonResponse(statusCode, message, data) {
  const res = {
    status: statusCode,
    success: statusCode >= 200 && statusCode < 300,
    message: message,
    data: data,
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}
