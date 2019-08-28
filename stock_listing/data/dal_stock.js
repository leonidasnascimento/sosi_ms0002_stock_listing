const admin = require('firebase-admin');
const db_collection = 'stock_list'

let service_account = require('../sosi_gcp_nosql_service_account.json');

module.exports = class {
    add_stock(obj) {
        admin.initializeApp({
            credential: admin.credential.cert(service_account)
        });

        let db = admin.firestore();
        let doc_ref = db.collection(db_collection).doc(obj.code);
        return doc_ref.set(obj);
    }
}