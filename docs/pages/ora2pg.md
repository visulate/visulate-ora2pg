# Visulate Ora2Pg
*A docker image and single page web application for Ora2Pg*

[Ora2Pg](https://github.com/darold/ora2pg) is an open source Perl script used to migrate an Oracle database to a PostgreSQL compatible schema. It connects an Oracle database, scans it to extract its structure or data, then generates SQL scripts for loading into a PostgreSQL database. It is a popular tool with users who are converting Oracle databases to PostgreSQL as part of a GCP or Azure migration (AWS has its own proprietary conversion tool).

Ora2Pg is a CLI application. It is a powerful tool in the hands of an experienced user but has usability issues for the first time user. The installation procedure is cumbersome with a number of prerequisite dependencies that must be installed manually. Once installed, the initial user experience is intimidating. Most of the functionality is controlled via a configuration file. This file is over 1100 lines long with many configuration parameters. It is not immediately apparent which parameters require user input.

This project aims to address some of the usability issues. It creates a Docker image to simplify the installation and adds a single page web application UI to control the configuration and execution of Ora2Pg.

The UI provides an HTML form to edit configuration parameters. This form allows the user to toggle between basic and advanced settings.
![Alt text](/images/visulate-ora2pg-config.png?raw=true "Visulate Ora2Pg configuration")

Once the configuration parameters have been set the user can run Ora2Pg via the UI and view its output.
![Alt text](/images/visulate-ora2pg-run.png?raw=true "Visulate Ora2Pg run results")

Output files are written to a Docker volume which can be bound to the host filesystem. There's also a UI to download output files.