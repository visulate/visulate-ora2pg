# Visulate for Oracle
*Visulate for Oracle is an Oracle data dictionary browsing service to help data engineers understand the structure and dependencies in Oracle databases that they plan to migrate to the Cloud.*


A registration file stores connection details for one or more the databases.  Visulate queries the data dictionary for each connection and allows the user to browse the result. It also allows DDL to be generated for individual objects or groups of objects.

![Alt text](https://visulate.net/images/object-selection.png?raw=true "Visulate for Oracle database object selection")

A report is generated for each database object by querying the appropriate dictionary views (e.g. DBA_TABLES and other views for table objects or DBA_SOURCE for packages)

![Alt text](https://visulate.net/images/object-details.png?raw=true "Visulate for Oracle object details")

This report also queries database's dependency model to identify dependencies to and from the object (e.g a view "uses" the tables it is based on and is "used by" a procedure that selects from it).  The dependency info identifies line numbers for references that appear in stored procedures.

![Alt text](https://visulate.net/images/object-dependencies.png?raw=true "Visulate for Oracle object dependencies")
