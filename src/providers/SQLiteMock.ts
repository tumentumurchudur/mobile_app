import { SQLite , SQLiteDatabaseConfig } from "@ionic-native/sqlite";

declare var SQL;

export class SQLiteMock {
  public create(config: SQLiteDatabaseConfig): Promise<SQLiteObject> {
	return new Promise((resolve, reject) => {
	  var db = new SQL.Database();

	  resolve(new SQLiteObject(db));
	});
  }
}

class SQLiteObject {
  _objectInstance: any;

  constructor(_objectInstance: any) {
	this._objectInstance = _objectInstance;
  };

  executeSql(statement: string, params: any): Promise<any> {
	return new Promise((resolve, reject) => {
	  try {
	    const st = this._objectInstance.prepare(statement, params);
	    const rows :Array<any> = [];

	    while(st.step()) { 
		  const row = st.getAsObject();
		  rows.push(row);
	    }

	    const payload = {
		  rows: {
			item: function(i) {
				return rows[i];
			},
			length: rows.length
		  },
		  rowsAffected: this._objectInstance.getRowsModified() || 0,
		  insertId: this._objectInstance.insertId || void 0
	    };  
	    resolve(payload);
	  } catch(e){
		reject(e);
	  }
	});
  };
}
