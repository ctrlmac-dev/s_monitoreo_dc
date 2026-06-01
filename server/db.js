// server/db.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, function(err) {
    if (err) console.error('Error al abrir la base de datos:', err.message);
    else console.log('Conectado a la base de datos SQLite.');
});

db.serialize(function() {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)');

    db.run('CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, ip TEXT, category TEXT)');

    var defaultUsers = [
        { username: 'admin', password: 'admin123', role: 'administrador' },
        { username: 'personal1', password: 'personal123', role: 'personal' },
        { username: 'practicante1', password: 'practic123', role: 'practicantes' },
        { username: 'apoyo1', password: 'apoyo123', role: 'apoyo' },
        { username: 'invitado1', password: 'invitado123', role: 'invitados' }
    ];

    defaultUsers.forEach(function(user) {
        db.get("SELECT * FROM users WHERE username = ?", [user.username], function(err, row) {
            if (!row) {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(user.password, salt);
                db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                    [user.username, hash, user.role],
                    function(err) {
                        if (!err) console.log('Usuario ' + user.username + ' (' + user.role + ') creado.');
                    }
                );
            }
        });
    });

    var defaultDevices = [
        // GABINETES
        { name: 'Monitoreo de Gabinete-1', ip: '10.5.9.113', category: 'gabinetes' },
        { name: 'Monitoreo de Gabinete-2-3', ip: '10.5.9.114', category: 'gabinetes' },
        { name: 'Monitoreo de Gabinete-4-5', ip: '10.5.9.115', category: 'gabinetes' },

        // UPS DATA CENTER
        { name: 'Monitoreo UPS DC-1', ip: '10.5.9.130', category: 'ups-dc' },
        { name: 'Monitoreo UPS DC-2', ip: '10.5.9.131', category: 'ups-dc' },

        // REFRIGERACION DATA CENTER
        { name: 'Monitoreo Refrigeracion DC-1', ip: '10.5.9.140', category: 'refrigeracion-dc' },
        { name: 'Monitoreo Refrigeracion DC-2', ip: '10.5.9.141', category: 'refrigeracion-dc' },
        { name: 'Monitoreo Refrigeracion DC-3', ip: '10.5.9.142', category: 'refrigeracion-dc' },

        // PDUs DATA CENTER
        { name: 'Monitoreo PDU-D', ip: '10.5.9.101', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-I', ip: '10.5.9.102', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-D', ip: '10.5.9.103', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-I', ip: '10.5.9.104', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-D', ip: '10.5.9.105', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-I', ip: '10.5.9.106', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-D', ip: '10.5.9.107', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-I', ip: '10.5.9.108', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-D', ip: '10.5.9.109', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-I', ip: '10.5.9.110', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-D', ip: '10.5.9.111', category: 'pdus-dc' },
        { name: 'Monitoreo PDU-I', ip: '10.5.9.112', category: 'pdus-dc' },

        // PDUs CUARTOS DE COMUNICACION
        { name: 'Monitoreo PDU-P1', ip: '10.5.9.1', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P2', ip: '10.5.9.2', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P3', ip: '10.5.9.3', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P4', ip: '10.5.9.4', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P5', ip: '10.5.9.5', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P6', ip: '10.5.9.6', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P7', ip: '10.5.9.7', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P8', ip: '10.5.9.8', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P9', ip: '10.5.9.9', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P10', ip: '10.5.9.10', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P11', ip: '10.5.9.11', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P12', ip: '10.5.9.12', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P13', ip: '10.5.9.13', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P14', ip: '10.5.9.14', category: 'pdus-cc' },
        { name: 'Monitoreo PDU-P15', ip: '10.5.9.15', category: 'pdus-cc' },

        // UPS CUARTOS DE COMUNICACION
        { name: 'Monitoreo UPS-P1', ip: '10.5.9.51', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P2', ip: '10.5.9.52', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P3', ip: '10.5.9.53', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P4', ip: '10.5.9.54', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P5', ip: '10.5.9.55', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P6', ip: '10.5.9.56', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P7', ip: '10.5.9.57', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P8', ip: '10.5.9.58', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P9', ip: '10.5.9.59', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P10', ip: '10.5.9.60', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P11', ip: '10.5.9.61', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P12', ip: '10.5.9.62', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P13', ip: '10.5.9.63', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P14', ip: '10.5.9.64', category: 'ups-cc' },
        { name: 'Monitoreo UPS-P15', ip: '10.5.9.65', category: 'ups-cc' }
    ];

    defaultDevices.forEach(function(dev) {
        db.get("SELECT * FROM devices WHERE ip = ?", [dev.ip], function(err, row) {
            if (!row) {
                db.run("INSERT INTO devices (name, ip, category) VALUES (?, ?, ?)",
                    [dev.name, dev.ip, dev.category],
                    function(err) {
                        if (!err) console.log('Dispositivo ' + dev.name + ' creado.');
                    }
                );
            }
        });
    });
});

module.exports = db;
