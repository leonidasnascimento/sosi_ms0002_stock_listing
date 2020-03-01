const admin = require('firebase-admin');
let service_account = require('../sosi_gcp_nosql_service_account.json');

const db_collection = 'stock_list'

module.exports = class {
    add_stock(obj, on_success, on_error) {
        this.initialize_app();

        let db = admin.firestore()
        let doc_ref = db.collection(db_collection).doc(obj.code);

        doc_ref
            .set(obj)
            .then(data => {
                on_success(data);
            })
            .catch(data => {
                on_error(data);
            });
    }

    get_stock(doc_id, on_success, on_error) {
        this.initialize_app();

        let db = admin.firestore();
        db.collection(db_collection).doc(doc_id)
            .get()
            .then((doc) => {
                if (!doc.exists) {
                    on_error("Documento '" + doc_id + "' does not exist!")
                } else {
                    on_success(doc.data())
                }
            })
            .catch((err) => {
                on_error('Error getting documents => ' + err)
            });
    }

    get_stocks_cvm_code(on_success, on_error) {
        this.initialize_app();

        admin.firestore()
            .collection(db_collection)
            .get()
            .then(doc => {
                let docs_aux = []

                doc.docs.forEach(d => {
                    if (d.data().cvm_code != "") {
                        let val = {
                            'stock': d.data().code,
                            'cvm_code': d.data().cvm_code
                        }
                        docs_aux.push(val)
                    }
                })

                on_success(docs_aux)
            })
            .catch((err) => {
                on_error('Error getting documents => ' + err)
            });
    }

    get_stock_code_list(on_success, on_error) {
        this.initialize_app();

        admin.firestore()
            .collection(db_collection)
            .get()
            .then(doc => {
                let docs_aux = []

                doc.docs.forEach(d => {
                    let data = d.data()
                    let val = {
                        'stock': ('code' in data) ? data.code : '',
                        'cvm_code': ('cvm_code' in data) ? data.cvm_code : '',
                        'available_volume': ('available_volume' in data) ? Number(data.available_volume) : 0,
                        'stock_type': ('stock_type' in data) ? data.stock_type : '',
                    }

                    docs_aux.push(val)
                })

                on_success(docs_aux)
            })
            .catch((err) => {
                on_error('Error getting documents => ' + err)
            });
    }

    delete_stock(doc_id, on_success, on_error) {
        on_error("Method not implementd!")
    }

    initialize_app() {
        if (admin.apps.length <= 0) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    clientEmail: service_account.client_email,
                    privateKey: String(service_account.private_key).replace(/\\n/g, '\n'),
                    projectId: service_account.project_id
                }),
                databaseURL: "https://" + String(service_account.project_id) + ".firebaseio.com"
            });
        }
    }
}