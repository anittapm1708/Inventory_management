const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const path = require("path");

const app = express();

// for bulk upload
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");

//const upload = multer({ dest: "uploads/" });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/templates", express.static(path.join(__dirname, "templates")));
app.use(express.static(path.join(__dirname, "static")));

// Serve navbar.js correctly
app.get("/navbar.js", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "navbar.js"));
});

app.use(express.json());
// app.set('view engine', 'ejs');

// Database connection configuration
const dbConfig = {
  user: "test",
  password: "test123",
  connectString: "192.168.1.10/FREEPDB1",
};

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/index.html"));
});

app.get("/submitForm", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/insert.html"));
});

app.get("/deleteForm", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/delete.html"));
});

app.get("/updateForm", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/update.html"));
});
app.get("/searchForm", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/search2.html"));
});

app.get("/uploadForm", (req, res) => {
  res.sendFile(path.join(__dirname, "/templates/upload.html"));
});

app.post("/submitData", async (req, res) => {
  const data = req.body;
  const tableName = req.query.TABLE_NAME;
  let connection;

  try {
    // Establish database connection
    connection = await oracledb.getConnection(dbConfig);

    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return res.status(400).send("Invalid table name.");
    }

    const query = `INSERT INTO ${tableName}
      (SERIAL_NUMBER, ACCOUNT_NAME, PRIMARY_DBA, BACKUP_DBA, CUST_SERVICE_PARTNER, TOM, LICENSE_OWNERSHIP_CUST_SVVS, CSI_IF_CUST_PROVIDED_LICENSE, CUS_POINT_OF_CONTACT_APPLICATION_OWNER, LOGIN_PROCEDURE, SERVER_NAME, IP_ADDRESS, LOC_IDC, OS_TYPE, INSTANCE, DATABASE_NAME, PLUGGABLE, DB_TYPE_DEV_PROD, DB_ROLE, IS_DB_DOWN, LAST_UP_DOWN_DATE, PRIM_SERVER, PRIM_INST, INSTANCE_TYPE, DB_VERSION, DB_EDITION_SE_EE, GRID_INFO, FILESYSTEM_ASM_FILESYSTEM, DB_SIZE_MB_GB_TB, DBID, OS_WATCHER, BACKUP_TYPE, BACKUP_TO_DISK_TAPE, BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION, BACKUP_SCRIPT_LOCATION, BACKUP_LOG_LOCATION, BACKUP_SCHEDULED, CATALOG_Y_N, CATALOG_DB_SERVER, CATALOG_USER, FULL_BACKUP_DETAILS, INCREMENTAL_BACKUP_DETAILS, ARCHIVE_BACKUP_DETAILS, MONITORED_BY, LAST_AUDIT_DATE, LAST_AUDITED_BY)
      VALUES
      (:SERIAL_NUMBER, :ACCOUNT_NAME, :PRIMARY_DBA, :BACKUP_DBA, :CUST_SERVICE_PARTNER, :TOM, :LICENSE_OWNERSHIP_CUST_SVVS, :CSI_IF_CUST_PROVIDED_LICENSE, :CUS_POINT_OF_CONTACT_APPLICATION_OWNER, :LOGIN_PROCEDURE, :SERVER_NAME, :IP_ADDRESS, :LOC_IDC, :OS_TYPE, :INSTANCE, :DATABASE_NAME, :PLUGGABLE, :DB_TYPE_DEV_PROD, :DB_ROLE, :IS_DB_DOWN, :LAST_UP_DOWN_DATE, :PRIM_SERVER, :PRIM_INST, :INSTANCE_TYPE, :DB_VERSION, :DB_EDITION_SE_EE, :GRID_INFO, :FILESYSTEM_ASM_FILESYSTEM, :DB_SIZE_MB_GB_TB, :DBID, :OS_WATCHER, :BACKUP_TYPE, :BACKUP_TO_DISK_TAPE, :BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION, :BACKUP_SCRIPT_LOCATION, :BACKUP_LOG_LOCATION, :BACKUP_SCHEDULED, :CATALOG_Y_N, :CATALOG_DB_SERVER, :CATALOG_USER, :FULL_BACKUP_DETAILS, :INCREMENTAL_BACKUP_DETAILS, :ARCHIVE_BACKUP_DETAILS, :MONITORED_BY, :LAST_AUDIT_DATE, :LAST_AUDITED_BY)`;

    // Ensure all necessary keys are present in the data object
    const keys = [
      "SERIAL_NUMBER",
      "ACCOUNT_NAME",
      "PRIMARY_DBA",
      "BACKUP_DBA",
      "CUST_SERVICE_PARTNER",
      "TOM",
      "LICENSE_OWNERSHIP_CUST_SVVS",
      "CSI_IF_CUST_PROVIDED_LICENSE",
      "CUS_POINT_OF_CONTACT_APPLICATION_OWNER",
      "LOGIN_PROCEDURE",
      "SERVER_NAME",
      "IP_ADDRESS",
      "LOC_IDC",
      "OS_TYPE",
      "INSTANCE",
      "DATABASE_NAME",
      "PLUGGABLE",
      "DB_TYPE_DEV_PROD",
      "DB_ROLE",
      "IS_DB_DOWN",
      "LAST_UP_DOWN_DATE",
      "PRIM_SERVER",
      "PRIM_INST",
      "INSTANCE_TYPE",
      "DB_VERSION",
      "DB_EDITION_SE_EE",
      "GRID_INFO",
      "FILESYSTEM_ASM_FILESYSTEM",
      "DB_SIZE_MB_GB_TB",
      "DBID",
      "OS_WATCHER",
      "BACKUP_TYPE",
      "BACKUP_TO_DISK_TAPE",
      "BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION",
      "BACKUP_SCRIPT_LOCATION",
      "BACKUP_LOG_LOCATION",
      "BACKUP_SCHEDULED",
      "CATALOG_Y_N",
      "CATALOG_DB_SERVER",
      "CATALOG_USER",
      "FULL_BACKUP_DETAILS",
      "INCREMENTAL_BACKUP_DETAILS",
      "ARCHIVE_BACKUP_DETAILS",
      "MONITORED_BY",
      "LAST_AUDIT_DATE",
      "LAST_AUDITED_BY",
    ];

    // Map the data to the expected format, assigning null where necessary
    const mappedData = keys.reduce((acc, key) => {
      acc[key] = data[key] ?? null;
      return acc;
    }, {});

    const result = await connection.execute(query, mappedData, {
      autoCommit: true,
    });

    console.log("Data inserted:", result.rowsAffected);
    res.send("Successfully entered the data.");
  } catch (error) {
    console.error("Error inserting data:", error);
    if (error.errorNum === 1) {
      res.status(409).send("Duplicate serial number error.");
    } else if (
      error.errorNum === 12541 ||
      error.message.includes("ORA-12541")
    ) {
      res.status(500).send("Cannot connect to server.");
    } else {
      res.status(500).send("Error inserting data.");
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});


app.post("/searchForm", async (req, res) => {
  const tableName = req.body.table;
  const jsonData = req.body;
  delete jsonData.table;

  let query = `SELECT * FROM ${tableName} WHERE `;
  const bindValues = {};

  for (const key in jsonData) {
    if (jsonData[key]) {
      query += `${key} LIKE :${key} AND `;
      bindValues[key] = `%${jsonData[key]}%`; // Add wildcard characters for LIKE
    }
  }
  query = query.slice(0, -5); // Remove the last "AND "
  console.log("Query:", query);
  console.log("Bind Values:", bindValues);

  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, bindValues);
    await connection.close();

    res.json(result.rows);
    //console.log("Data fetched:", result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

app.get("/fetchData/:serial_no", async (req, res) => {
  const serial_no = req.params.serial_no;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM arterra WHERE serial_number = :serial_no`,
      [serial_no],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows[0]);
    console.log("Data fetched:", result.rows[0]);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.sendStatus(500);
  }
});

app.post("/updateForm", async (req, res) => {
  const data = req.body; // Extract data from request body
  console.log("Received data at server:", data);
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig); // Establish database connection

    // Begin transaction
    await connection.execute("BEGIN NULL; END;");

    
    const updateQuery = `
      UPDATE arterra
      SET
          ACCOUNT_NAME = :ACCOUNT_NAME,
          PRIMARY_DBA = :PRIMARY_DBA,
          BACKUP_DBA = :BACKUP_DBA,
          CUST_SERVICE_PARTNER = :CUST_SERVICE_PARTNER,
          TOM = :TOM,
          LICENSE_OWNERSHIP_CUST_SVVS = :LICENSE_OWNERSHIP_CUST_SVVS,
          CSI_IF_CUST_PROVIDED_LICENSE = :CSI_IF_CUST_PROVIDED_LICENSE,
          CUS_POINT_OF_CONTACT_APPLICATION_OWNER = :CUS_POINT_OF_CONTACT_APPLICATION_OWNER,
          LOGIN_PROCEDURE = :LOGIN_PROCEDURE,
          SERVER_NAME = :SERVER_NAME,
          IP_ADDRESS = :IP_ADDRESS,
          LOC_IDC = :LOC_IDC,
          OS_TYPE = :OS_TYPE,
          INSTANCE = :INSTANCE,
          DATABASE_NAME = :DATABASE_NAME,
          PLUGGABLE = :PLUGGABLE,
          DB_TYPE_DEV_PROD = :DB_TYPE_DEV_PROD,
          DB_ROLE = :DB_ROLE,
          IS_DB_DOWN = :IS_DB_DOWN,
          LAST_UP_DOWN_DATE = :LAST_UP_DOWN_DATE,
          PRIM_SERVER = :PRIM_SERVER,
          PRIM_INST = :PRIM_INST,
          INSTANCE_TYPE = :INSTANCE_TYPE,
          DB_VERSION = :DB_VERSION,
          DB_EDITION_SE_EE = :DB_EDITION_SE_EE,
          GRID_INFO = :GRID_INFO,
          FILESYSTEM_ASM_FILESYSTEM = :FILESYSTEM_ASM_FILESYSTEM,
          DB_SIZE_MB_GB_TB = :DB_SIZE_MB_GB_TB,
          DBID = :DBID,
          OS_WATCHER = :OS_WATCHER,
          BACKUP_TYPE = :BACKUP_TYPE,
          BACKUP_TO_DISK_TAPE = :BACKUP_TO_DISK_TAPE,
          BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION = :BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION,
          BACKUP_SCRIPT_LOCATION = :BACKUP_SCRIPT_LOCATION,
          BACKUP_LOG_LOCATION = :BACKUP_LOG_LOCATION,
          BACKUP_SCHEDULED = :BACKUP_SCHEDULED,
          CATALOG_Y_N = :CATALOG_Y_N,
          CATALOG_DB_SERVER = :CATALOG_DB_SERVER,
          CATALOG_USER = :CATALOG_USER,
          FULL_BACKUP_DETAILS = :FULL_BACKUP_DETAILS,
          INCREMENTAL_BACKUP_DETAILS = :INCREMENTAL_BACKUP_DETAILS,
          ARCHIVE_BACKUP_DETAILS = :ARCHIVE_BACKUP_DETAILS,
          MONITORED_BY = :MONITORED_BY,
          LAST_AUDIT_DATE = :LAST_AUDIT_DATE,
          LAST_AUDITED_BY = :LAST_AUDITED_BY
      WHERE
          SERIAL_NUMBER = :SERIAL_NUMBER
    `;

    // Bind values for the query, including the serial number for WHERE clause
    const binds = {
      SERIAL_NUMBER: data.SERIAL_NUMBER,
      ACCOUNT_NAME: data.ACCOUNT_NAME,
      PRIMARY_DBA: data.PRIMARY_DBA,
      BACKUP_DBA: data.BACKUP_DBA,
      CUST_SERVICE_PARTNER: data.CUST_SERVICE_PARTNER,
      TOM: data.TOM,
      LICENSE_OWNERSHIP_CUST_SVVS: data.LICENSE_OWNERSHIP_CUST_SVVS,
      CSI_IF_CUST_PROVIDED_LICENSE: data.CSI_IF_CUST_PROVIDED_LICENSE,
      CUS_POINT_OF_CONTACT_APPLICATION_OWNER:
        data.CUS_POINT_OF_CONTACT_APPLICATION_OWNER,
      LOGIN_PROCEDURE: data.LOGIN_PROCEDURE,
      SERVER_NAME: data.SERVER_NAME,
      IP_ADDRESS: data.IP_ADDRESS,
      LOC_IDC: data.LOC_IDC,
      OS_TYPE: data.OS_TYPE,
      INSTANCE: data.INSTANCE,
      DATABASE_NAME: data.DATABASE_NAME,
      PLUGGABLE: data.PLUGGABLE,
      DB_TYPE_DEV_PROD: data.DB_TYPE_DEV_PROD,
      DB_ROLE: data.DB_ROLE,
      IS_DB_DOWN: data.IS_DB_DOWN,
      LAST_UP_DOWN_DATE: data.LAST_UP_DOWN_DATE,
      PRIM_SERVER: data.PRIM_SERVER,
      PRIM_INST: data.PRIM_INST,
      INSTANCE_TYPE: data.INSTANCE_TYPE,
      DB_VERSION: data.DB_VERSION,
      DB_EDITION_SE_EE: data.DB_EDITION_SE_EE,
      GRID_INFO: data.GRID_INFO,
      FILESYSTEM_ASM_FILESYSTEM: data.FILESYSTEM_ASM_FILESYSTEM,
      DB_SIZE_MB_GB_TB: data.DB_SIZE_MB_GB_TB,
      DBID: data.DBID,
      OS_WATCHER: data.OS_WATCHER,
      BACKUP_TYPE: data.BACKUP_TYPE,
      BACKUP_TO_DISK_TAPE: data.BACKUP_TO_DISK_TAPE,
      BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION:
        data.BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION,
      BACKUP_SCRIPT_LOCATION: data.BACKUP_SCRIPT_LOCATION,
      BACKUP_LOG_LOCATION: data.BACKUP_LOG_LOCATION,
      BACKUP_SCHEDULED: data.BACKUP_SCHEDULED,
      CATALOG_Y_N: data.CATALOG_Y_N,
      CATALOG_DB_SERVER: data.CATALOG_DB_SERVER,
      CATALOG_USER: data.CATALOG_USER,
      FULL_BACKUP_DETAILS: data.FULL_BACKUP_DETAILS,
      INCREMENTAL_BACKUP_DETAILS: data.INCREMENTAL_BACKUP_DETAILS,
      ARCHIVE_BACKUP_DETAILS: data.ARCHIVE_BACKUP_DETAILS,
      MONITORED_BY: data.MONITORED_BY,
      LAST_AUDIT_DATE: data.LAST_AUDIT_DATE,
      LAST_AUDITED_BY: data.LAST_AUDITED_BY,
    };

    // Execute the update query
    const result = await connection.execute(updateQuery, binds, {
      autoCommit: false,
    });

    // Commit the transaction
    await connection.commit();

    console.log("Data updated:", result.rowsAffected);
    res.send("Successfully updated the data.");
  } catch (error) {
    console.error("Error updating data:", error);

    // Rollback the transaction in case of an error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }

    res.sendStatus(500);
  } finally {
    // Always close the connection
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

app.post("/deleteData/:serial_no", async (req, res) => {
  const serial_no = req.params.serial_no; // Extract serial number from route parameter
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig); // Establish database connection

    // Begin transaction
    await connection.execute('BEGIN NULL; END;');

    // Archive the record before deletion
    const archiveQuery = `
      INSERT INTO archive_arterra
      SELECT * FROM arterra WHERE SERIAL_NUMBER = :serial_no
    `;
    await connection.execute(archiveQuery, [serial_no]);

    // Delete the record
    const deleteQuery = `
      DELETE FROM arterra WHERE SERIAL_NUMBER = :serial_no
    `;
    const result = await connection.execute(deleteQuery, [serial_no], { autoCommit: false });

    // Commit the transaction
    await connection.commit();

    console.log("Data archived and deleted:", result.rowsAffected);
    res.send("Successfully deleted the data.");
  } catch (error) {
    console.error("Error deleting data:", error);

    // Rollback the transaction in case of an error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }

    res.sendStatus(500);
  } finally {
    // Always close the connection
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});


const upload = multer({ dest: "uploads/" });

// Route to handle file upload and insertion into Oracle DB
app.post("/uploadData", upload.single("csvfile"), async (req, res) => {
  if (!req.file) {

    return res.status(400).json({ message: "No file uploaded." });
  }

  const csvFilePath = path.join(__dirname, req.file.path);
  const results = [];

  // Read CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csvParser())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        // Insert data into Oracle DB
        const rowsInserted = await insertIntoOracle(results);
        fs.unlinkSync(csvFilePath);
        res
          .status(200)
          .json({
            message: "Data inserted into OracleDB successfully.",
            rowsInserted,
          });
      } catch (err) {
        console.error("Error inserting data:", err);
        res
          .status(500)
          .json({ message: "Error inserting data into OracleDB." });
      }
    });

  // Remove uploaded file after reading
  
});

// Function to insert data into OracleDB
async function insertIntoOracle(data) {
  let connection;

  try {
    // Connect to Oracle DB
    connection = await oracledb.getConnection(dbConfig);

    // Begin transaction
    const sql = generateInsertSQL(data[0]); // Assuming data[0] has headers
    const binds = data.map((row) => Object.values(row));

    // Execute insert statements in a batch
    const options = { autoCommit: true, bindDefs: getBindDefs(data[0]) };
    const result = await connection.executeMany(sql, binds, options);

    console.log("Rows inserted:", result.rowsAffected);
    return result.rowsAffected;
  } catch (err) {
    throw err;
  } finally {
    // Release Oracle DB connection
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Helper function to generate INSERT SQL statement
function generateInsertSQL(headerRow) {
  const tableName = "arterra";
  const columns = Object.keys(headerRow).join(", ");
  const values = Object.keys(headerRow)
    .map((key, index) => `:${index + 1}`)
    .join(", ");

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
}

// Helper function to generate bind definitions for executeMany
function getBindDefs(headerRow) {
  return Object.values(headerRow).map((value) => ({
    type: oracledb.STRING,
    maxSize: 255, // Adjust data type as per your column types in Oracle DB
  }));
}



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
