const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'TuClaveSecretaSuperSeguraParaDatacenter';

app.use(cors());
// express.json() solo en rutas /api/ — si se aplica globalmente consume el body
// del stream antes de que el proxy pueda reenviarlo al dispositivo, causando 400.
app.use('/api', express.json());

// 1. RUTA DE LOGIN
app.post('/api/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    db.get("SELECT * FROM users WHERE username = ?", [username], function(err, user) {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

        var isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Contrasena incorrecta' });

        var token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            SECRET_KEY,
            { expiresIn: '8h' }
        );

        res.json({ message: 'Login exitoso', token: token, username: user.username, role: user.role });
    });
});

// 2. MIDDLEWARE DE VERIFICACION DE TOKEN
const verifyToken = function(req, res, next) {
    var authHeader = req.headers['authorization'];
    var token = authHeader ? authHeader.split(' ')[1] : req.query.token;

    if (!token) return res.status(403).send('Acceso denegado. Se requiere Token.');

    jwt.verify(token, SECRET_KEY, function(err, decoded) {
        if (err) return res.status(401).send('Token invalido o expirado.');
        req.user = decoded;
        next();
    });
};

// 3. MIDDLEWARE DE VERIFICACION DE ROLES
const checkRole = function(allowedRoles) {
    return function(req, res, next) {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
        }
        next();
    };
};

// 4. RUTAS PROTEGIDAS GENERALES
app.get('/api/status', verifyToken, function(req, res) {
    res.json({ status: 'online', message: 'Servidor seguro', user: req.user.username, role: req.user.role });
});

// 5. GESTION DE USUARIOS (SOLO ADMINISTRADOR)
app.get('/api/users', verifyToken, checkRole(['administrador']), function(req, res) {
    db.all("SELECT id, username, role FROM users", function(err, rows) {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        res.json(rows);
    });
});

app.post('/api/users', verifyToken, checkRole(['administrador']), function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'username, password y role son requeridos' });
    }

    var allowedRoles = ['administrador', 'personal', 'practicantes', 'apoyo', 'invitados'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: 'Rol no valido' });
    }

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
        [username, hash, role],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'El usuario ya existe' });
                }
                return res.status(500).json({ error: 'Error al crear usuario' });
            }
            res.json({ message: 'Usuario creado exitosamente' });
        }
    );
});

app.delete('/api/users/:id', verifyToken, checkRole(['administrador']), function(req, res) {
    var id = req.params.id;

    if (parseInt(id) === 1) {
        return res.status(400).json({ error: 'No se puede eliminar al usuario administrador principal' });
    }

    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });
        res.json({ message: 'Usuario eliminado exitosamente' });
    });
});

// 6. PROXY INVERSO PARA INTERFACES DE DISPOSITIVOS (EVITA CORS)
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

function buildFixScript(ip) {
    var proxyPrefix = '/proxy/' + ip;
    return '<script>' +
        '(function(){' +
        'try{if(window.parent&&!window.parent.rittal){var _n=function(){return null;};window.parent.rittal={language:{getLanguageTable:function(){return{};},getLanguage:function(){return"en";},translate:function(k){return k||"";}},devicemanager:{getDevice:_n,getDevices:function(){return[];},register:_n,unregister:_n,getDeviceInfos:function(){return{start:_n}}},Util:{format:_n,log:_n,debug:_n}};}}catch(e){}' +
        // Evitar que el dispositivo navegue el top frame o detecte que está en iframe
        'try{Object.defineProperty(window,"top",{get:function(){return window;}});}catch(e){}' +
        'function _fixUrl(u){if(u&&typeof u==="string"&&u.startsWith("/")&&!u.startsWith("'+proxyPrefix+'")){return "'+proxyPrefix+'"+u;}return u;}' +
        // Parche para fetch
        'var _origFetch=window.fetch;window.fetch=function(url,opts){return _origFetch.call(window,_fixUrl(url),opts);};' +
        // Parche para XMLHttpRequest.open
        'var _origOpen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){var args=Array.prototype.slice.call(arguments);args[1]=_fixUrl(u);return _origOpen.apply(this,args);};' +
        // Parche para form submit — corregir action
        'document.addEventListener("submit",function(e){var f=e.target;if(f&&f.getAttribute){var a=f.getAttribute("action");if(a&&a.startsWith("/")&&!a.startsWith("'+proxyPrefix+'")){f.setAttribute("action","'+proxyPrefix+'"+a);}}},true);' +
        // Parche para click en links
        'document.addEventListener("click",function(e){var a=e.target.closest?e.target.closest("a"):null;if(a&&a.href){var h=a.getAttribute("href");if(h&&h.startsWith("/")&&!h.startsWith("'+proxyPrefix+'")){a.setAttribute("href","'+proxyPrefix+'"+h);}}},true);' +
        // Declarar stubs de variables globales que Rittal espera
        'if(typeof chartTable==="undefined"){window.chartTable=[];}' +
        // Suprimir errores cross-origin y de variables no definidas de Rittal
        'window.onerror=function(m){var s=String(m);if(s.indexOf("cross-origin")!==-1||s.indexOf("SecurityError")!==-1||s.indexOf("is not defined")!==-1)return true;};' +
        '})();' +
        '</script>';
}

const proxyCache = {};

function getDeviceProxy(ip) {
    if (!proxyCache[ip]) {
        var escapedIp = ip.replace(/\./g, '\\.');
        var deviceUrlRegex = new RegExp('http://' + escapedIp + '(:\\d+)?/', 'g');
        var proxyBase = '/proxy/' + ip + '/';

        proxyCache[ip] = createProxyMiddleware({
            target: 'http://' + ip,
            changeOrigin: true,
            ws: true,
            selfHandleResponse: true,
            pathRewrite: function(path) {
                return path.replace(new RegExp('^/proxy/' + escapedIp + '(/|$)'), '/') || '/';
            },
            on: {
                proxyRes: responseInterceptor(async function(responseBuffer, proxyRes, req, res) {
                    try {
                        // http-proxy-middleware v4 copia headers a res ANTES de llamar al interceptor,
                        // por lo que debemos modificar res directamente para que los cambios tengan efecto.
                        
                        // Eliminar headers de seguridad que bloquean iframes cross-origin
                        res.removeHeader('x-frame-options');
                        res.removeHeader('content-security-policy');
                        res.removeHeader('content-security-policy-report-only');

                        // Deshabilitar cache para que siempre pase por el proxy
                        res.setHeader('cache-control', 'no-store, no-cache, must-revalidate');
                        res.setHeader('pragma', 'no-cache');

                        // Reescribir header Location en redirecciones (ej. después del login)
                        var location = proxyRes.headers['location'];
                        if (location) {
                            if (location.startsWith('http://' + ip) || location.startsWith('https://' + ip)) {
                                try {
                                    var locParsed = new URL(location);
                                    res.setHeader('location', '/proxy/' + ip + locParsed.pathname + locParsed.search);
                                } catch (e) {}
                            } else if (location.startsWith('/') && !location.startsWith('/proxy/')) {
                                res.setHeader('location', '/proxy/' + ip + location);
                            }
                        }

                        // Reescribir Set-Cookie path para que las cookies funcionen a través del proxy
                        var setCookie = proxyRes.headers['set-cookie'];
                        if (setCookie) {
                            var rewrittenCookies = (Array.isArray(setCookie) ? setCookie : [setCookie])
                                .map(function(c) {
                                    // Eliminar domain
                                    c = c.replace(/;\s*domain\s*=\s*[^;]+/gi, '');
                                    // Si tiene path=/, reescribirlo
                                    if (/;\s*path\s*=/i.test(c)) {
                                        c = c.replace(/;\s*path\s*=\s*\/(?!proxy\/)/gi, '; path=/proxy/' + ip + '/');
                                    } else {
                                        // Si no tiene path, agregar uno para que la cookie se envíe en todas las rutas del proxy
                                        c = c + '; path=/proxy/' + ip + '/';
                                    }
                                    return c;
                                });
                            res.setHeader('set-cookie', rewrittenCookies);
                        }

                        var contentType = proxyRes.headers['content-type'] || '';
                        var url = req.url || '';

                        var isText = contentType.includes('text/html') ||
                                     contentType.includes('javascript') ||
                                     contentType.includes('text/plain') ||
                                     contentType.includes('text/css') ||
                                     ((contentType.includes('application/octet-stream') || contentType === '') &&
                                      /\.(js|html|css)(\?|$)/i.test(url));

                        if (isText && responseBuffer.length > 0) {
                            var text = responseBuffer.toString('utf8');
                            if (text.includes('http://' + ip)) {
                                text = text.replace(deviceUrlRegex, proxyBase);
                            }

                            // Reescribir rutas absolutas en HTML para que pasen por el proxy
                            // ej: src="/mqtt.js" → src="/proxy/ip/mqtt.js"
                            if (contentType.includes('text/html')) {
                                var script = buildFixScript(ip);
                                if (/<head[^>]*>/i.test(text)) {
                                    text = text.replace(/(<head[^>]*>)/i, '$1' + script);
                                } else {
                                    text = script + text;
                                }
                                // Reescribir atributos src/href/action con rutas absolutas que aún no tienen el prefijo proxy
                                text = text.replace(
                                    /((?:src|href|action|data|poster|background|formaction)\s*=\s*["'])\/(?!\/|proxy\/)/gi,
                                    '$1' + proxyBase
                                );
                                // Reescribir url() en CSS inline
                                text = text.replace(
                                    /(url\s*\(\s*["']?)\/(?!\/|proxy\/)/gi,
                                    '$1' + proxyBase
                                );
                            }
                            // Nota: NO reescribir strings en JS estático — causa doble prefijo con loaders
                            // como require.js/dojo. El buildFixScript parchea fetch/XHR en runtime.
                            // EXCEPCIÓN: reescribir baseUrl de Dojo y rutas de registerModulePath
                            if (contentType.includes('javascript') || /\.js(\?|$)/i.test(url)) {
                                // Reescribir baseUrl:"/..." en configuración de Dojo
                                text = text.replace(
                                    /(baseUrl\s*[=:]\s*["'])\/(?!proxy\/)/gi,
                                    '$1' + proxyBase
                                );
                                // Reescribir registerModulePath("/...")
                                text = text.replace(
                                    /(registerModulePath\s*\(\s*["'][^"']*["']\s*,\s*["'])\/(?!proxy\/)/gi,
                                    '$1' + proxyBase
                                );
                            }
                            // Reescribir url() en archivos CSS
                            if (contentType.includes('text/css') || /\.css(\?|$)/i.test(url)) {
                                text = text.replace(
                                    /(url\s*\(\s*["']?)\/(?!\/|proxy\/|data:)/gi,
                                    '$1' + proxyBase
                                );
                            }
                            return text;
                        }
                        return responseBuffer;
                    } catch (err) {
                        console.error('[Proxy Error]', ip, req.method, req.url, err.message);
                        return responseBuffer;
                    }
                })
            }
        });
    }
    return proxyCache[ip];
}

app.use(/^\/proxy\/([^/]+)/, function(req, res, next) {
    var match = req.originalUrl.match(/^\/proxy\/([^/?]+)/);
    if (!match) return next();
    var ip = match[1];
    return getDeviceProxy(ip)(req, res, next);
});


// 7. GESTION DE DISPOSITIVOS
app.get('/api/devices', verifyToken, function(req, res) {
    db.all("SELECT * FROM devices", function(err, rows) {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        res.json(rows);
    });
});

app.get('/api/devices/:category', verifyToken, function(req, res) {
    db.all("SELECT * FROM devices WHERE category = ?", [req.params.category], function(err, rows) {
        if (err) return res.status(500).json({ error: 'Error en la base de datos' });
        res.json(rows);
    });
});

app.post('/api/devices', verifyToken, checkRole(['administrador']), function(req, res) {
    var name = req.body.name;
    var ip = req.body.ip;
    var category = req.body.category;

    if (!name || !ip || !category) {
        return res.status(400).json({ error: 'name, ip y category son requeridos' });
    }

    var allowedCategories = ['gabinetes', 'ups-dc', 'ups-cc', 'refrigeracion-dc', 'pdus-dc', 'pdus-cc'];
    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: 'Categoria no valida' });
    }

    db.run("INSERT INTO devices (name, ip, category) VALUES (?, ?, ?)",
        [name, ip, category],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Ya existe un dispositivo con esa IP' });
                }
                return res.status(500).json({ error: 'Error al crear dispositivo' });
            }
            res.json({ message: 'Dispositivo creado exitosamente', id: this.lastID });
        }
    );
});

app.put('/api/devices/:id', verifyToken, checkRole(['administrador']), function(req, res) {
    var name = req.body.name;
    var ip = req.body.ip;
    var category = req.body.category;
    var id = req.params.id;

    if (!name || !ip || !category) {
        return res.status(400).json({ error: 'name, ip y category son requeridos' });
    }

    var allowedCategories = ['gabinetes', 'ups-dc', 'ups-cc', 'refrigeracion-dc', 'pdus-dc', 'pdus-cc'];
    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: 'Categoria no valida' });
    }

    db.run("UPDATE devices SET name = ?, ip = ?, category = ? WHERE id = ?",
        [name, ip, category, id],
        function(err) {
            if (err) return res.status(500).json({ error: 'Error al actualizar dispositivo' });
            res.json({ message: 'Dispositivo actualizado exitosamente' });
        }
    );
});

app.delete('/api/devices/:id', verifyToken, checkRole(['administrador']), function(req, res) {
    var id = req.params.id;

    db.run("DELETE FROM devices WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: 'Error al eliminar dispositivo' });
        res.json({ message: 'Dispositivo eliminado exitosamente' });
    });
});

app.listen(PORT, '0.0.0.0', function() {
    console.log('Servidor backend seguro corriendo en http://localhost:' + PORT);
});
