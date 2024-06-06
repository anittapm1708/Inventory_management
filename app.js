const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/static", express.static(path.join(__dirname, "static")));
app.use(express.json());
// app.set('view engine', 'ejs');

// Database connection configuration
const dbConfig = {
  user: "test",
  password: "test123",
  connectString: "192.168.1.7/FREEPDB1",
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
  res.sendFile(path.join(__dirname, "/templates/search.html"));
});

app.post("/submitData", async (req, res) => {
  const data = req.body;
  const table_name = req.query.TABLE_NAME;
  try {
    const connection = await oracledb.getConnection(dbConfig); // Establish database connection
    const query = `INSERT INTO ${table_name}
(SERIAL_NUMBER,ACCOUNT_NAME, PRIMARY_DBA, BACKUP_DBA, CUST_SERVICE_PARTNER, TOM, LICENSE_OWNERSHIP_CUST_SVVS, CSI_IF_CUST_PROVIDED_LICENSE, CUS_POINT_OF_CONTACT_APPLICATION_OWNER, LOGIN_PROCEDURE, SERVER_NAME, IP_ADDRESS, LOC_IDC, OS_TYPE, INSTANCE, DATABASE_NAME, PLUGGABLE, DB_TYPE_DEV_PROD, DB_ROLE, IS_DB_DOWN, LAST_UP_DOWN_DATE, PRIM_SERVER, PRIM_INST, INSTANCE_TYPE, DB_VERSION, DB_EDITION_SE_EE, GRID_INFO, FILESYSTEM_ASM_FILESYSTEM, DB_SIZE_MB_GB_TB, DBID, OS_WATCHER, BACKUP_TYPE, BACKUP_TO_DISK_TAPE, BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION, BACKUP_SCRIPT_LOCATION, BACKUP_LOG_LOCATION, BACKUP_SCHEDULED, CATALOG_Y_N, CATALOG_DB_SERVER, CATALOG_USER, FULL_BACKUP_DETAILS, INCREMENTAL_BACKUP_DETAILS, ARCHIVE_BACKUP_DETAILS, MONITORED_BY, LAST_AUDIT_DATE, LAST_AUDITED_BY)
VALUES
(:SERIAL_NUMBER,:ACCOUNT_NAME, :PRIMARY_DBA, :BACKUP_DBA, :CUST_SERVICE_PARTNER, :TOM, :LICENSE_OWNERSHIP_CUST_SVVS, :CSI_IF_CUST_PROVIDED_LICENSE, :CUS_POINT_OF_CONTACT_APPLICATION_OWNER, :LOGIN_PROCEDURE, :SERVER_NAME, :IP_ADDRESS, :LOC_IDC, :OS_TYPE, :INSTANCE, :DATABASE_NAME, :PLUGGABLE, :DB_TYPE_DEV_PROD, :DB_ROLE, :IS_DB_DOWN, :LAST_UP_DOWN_DATE, :PRIM_SERVER, :PRIM_INST, :INSTANCE_TYPE, :DB_VERSION, :DB_EDITION_SE_EE, :GRID_INFO, :FILESYSTEM_ASM_FILESYSTEM, :DB_SIZE_MB_GB_TB, :DBID, :OS_WATCHER, :BACKUP_TYPE, :BACKUP_TO_DISK_TAPE, :BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION, :BACKUP_SCRIPT_LOCATION, :BACKUP_LOG_LOCATION, :BACKUP_SCHEDULED, :CATALOG_Y_N, :CATALOG_DB_SERVER, :CATALOG_USER, :FULL_BACKUP_DETAILS, :INCREMENTAL_BACKUP_DETAILS, :ARCHIVE_BACKUP_DETAILS, :MONITORED_BY, :LAST_AUDIT_DATE, :LAST_AUDITED_BY)
`;
console.log(query);

    // Assuming that req.body contains all the necessary fields
    const result = await connection.execute(query, data, { autoCommit: true });

    console.log("Data inserted:", result.rowsAffected);
    res.send("Successfully entered the data.");
  } catch (error) {
    console.error("Error inserting data:", error);
    res.sendStatus(500);
  }
});

// 
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
  const data = req.body;
  console.log("Received data at server:", data);
  try {
    const connection = await oracledb.getConnection(dbConfig); // Establish database connection

    // Update query for "arterra" table
    const query = `
            UPDATE arterra
            SET
                SERIAL_NUMBER = :SERIAL_NUMBER,
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

    // Bind values for the query
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
    const result = await connection.execute(query, binds, { autoCommit: true });

    console.log("Data updated:", result.rowsAffected);
    // Show alert popup on successful updation
    res.send("Successfully updated the data.");
    //   alert("Record updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
    
    res.sendStatus(500);
  }
});

app.post("/deleteData/:serial_no", async (req, res) => {
  const serial_no = req.params.serial_no; // Extract incident ID from route parameter

  try {
    const connection = await oracledb.getConnection(dbConfig); // Establish database connection

    const result = await connection.execute(
      `DELETE FROM arterra WHERE SERIAL_NUMBER = :serial_no`,
      [serial_no],
      { autoCommit: true }
    );

    console.log("Data deleted:", result.rowsAffected);
    res.send("Successfully deleted the data.");
  } catch (error) {
    console.error("Error deleting data:", error);
    res.sendStatus(500);
  }
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
