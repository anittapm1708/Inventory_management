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

app.post("/submitData", async (req, res) => {
  const data = req.body;
  const table_name = req.query.TABLE_NAME;
  try {
    const connection = await oracledb.getConnection(dbConfig); // Establish database connection
    const query = `INSERT INTO ${table_name}
(ACCOUNT_NAME, PRIMARY_DBA, BACKUP_DBA, CUST_SERVICE_PARTNER, TOM, LICENSE_OWNERSHIP_CUST_SVVS, CSI_IF_CUST_PROVIDED_LICENSE, CUS_POINT_OF_CONTACT_APPLICATION_OWNER, LOGIN_PROCEDURE, SERVER_NAME, IP_ADDRESS, LOC_IDC, OS_TYPE, INSTANCE, DATABASE_NAME, PLUGGABLE, DB_TYPE_DEV_PROD, DB_ROLE, IS_DB_DOWN, LAST_UP_DOWN_DATE, PRIM_SERVER, PRIM_INST, INSTANCE_TYPE, DB_VERSION, DB_EDITION_SE_EE, GRID_INFO, FILESYSTEM_ASM_FILESYSTEM, DB_SIZE_MB_GB_TB, DBID, OS_WATCHER, BACKUP_TYPE, BACKUP_TO_DISK_TAPE, BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION, BACKUP_SCRIPT_LOCATION, BACKUP_LOG_LOCATION, BACKUP_SCHEDULED, CATALOG_Y_N, CATALOG_DB_SERVER, CATALOG_USER, FULL_BACKUP_DETAILS, INCREMENTAL_BACKUP_DETAILS, ARCHIVE_BACKUP_DETAILS, MONITORED_BY, LAST_AUDIT_DATE, LAST_AUDITED_BY)
VALUES
(:ACCOUNT_NAME, :PRIMARY_DBA, :BACKUP_DBA, :CUST_SERVICE_PARTNER, :TOM, :LICENSE_OWNERSHIP_CUST_SVVS, :CSI_IF_CUST_PROVIDED_LICENSE, :CUS_POINT_OF_CONTACT_APPLICATION_OWNER, :LOGIN_PROCEDURE, :SERVER_NAME, :IP_ADDRESS, :LOC_IDC, :OS_TYPE, :INSTANCE, :DATABASE_NAME, :PLUGGABLE, :DB_TYPE_DEV_PROD, :DB_ROLE, :IS_DB_DOWN, :LAST_UP_DOWN_DATE, :PRIM_SERVER, :PRIM_INST, :INSTANCE_TYPE, :DB_VERSION, :DB_EDITION_SE_EE, :GRID_INFO, :FILESYSTEM_ASM_FILESYSTEM, :DB_SIZE_MB_GB_TB, :DBID, :OS_WATCHER, :BACKUP_TYPE, :BACKUP_TO_DISK_TAPE, :BACKUP_LOCATION_POLICY_OR_NFS_SHARED_LOCATION, :BACKUP_SCRIPT_LOCATION, :BACKUP_LOG_LOCATION, :BACKUP_SCHEDULED, :CATALOG_Y_N, :CATALOG_DB_SERVER, :CATALOG_USER, :FULL_BACKUP_DETAILS, :INCREMENTAL_BACKUP_DETAILS, :ARCHIVE_BACKUP_DETAILS, :MONITORED_BY, :LAST_AUDIT_DATE, :LAST_AUDITED_BY)
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
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
