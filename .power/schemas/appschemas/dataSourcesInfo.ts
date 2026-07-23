/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 * This file is auto-generated. Do not modify it manually.
 * Changes to this file may be overwritten.
 */

export const dataSourcesInfo = {
  "cr22e_contactosproveedors": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_contactosproveedorid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_departamentoses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_departamentosid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_equipostis": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_equipostiid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_excepcionescalidaddatoses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_excepcionescalidaddatosid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_facturasdecompratis": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_facturasdecompratiid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_proveedoreses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_proveedoresid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_razonsocials": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_razonsocialid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_serviciosproveedorsucursals": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_serviciosproveedorsucursalid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_sucursaleses": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_sucursalesid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "cr22e_ubicacionessucursals": {
    "tableId": "",
    "version": "",
    "primaryKey": "cr22e_ubicacionessucursalid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "retrieveaadusersetofprivilegesbynames": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Dataverse",
    "apis": {
      "RetrieveAadUserSetOfPrivilegesByNames": {
        "path": "/api/data/v9.2/RetrieveAadUserSetOfPrivilegesByNames",
        "method": "GET",
        "parameters": [
          {
            "name": "DirectoryObjectId",
            "in": "query",
            "required": true,
            "type": "string",
            "format": "guid"
          },
          {
            "name": "PrivilegeNames",
            "in": "query",
            "required": true,
            "type": "array"
          }
        ],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      }
    }
  },
  "transactioncurrencies": {
    "tableId": "",
    "version": "",
    "primaryKey": "transactioncurrencyid",
    "dataSourceType": "Dataverse",
    "apis": {}
  },
  "whoami": {
    "tableId": "",
    "version": "",
    "primaryKey": "",
    "dataSourceType": "Dataverse",
    "apis": {
      "WhoAmI": {
        "path": "/api/data/v9.2/WhoAmI",
        "method": "GET",
        "parameters": [],
        "responseInfo": {
          "200": {
            "type": "object"
          }
        }
      }
    }
  }
};
