import express from'express'
const app = express();
const PORT = 8080;
import bodyParser from'body-parser'
import { test, login, Registrar, infouser, actualizaInfo, uploadfoto, crearAlbum, getAlbumsUser, changeAlbums, getFotosAlbum, deleteAlbum, getFotosUser} from './funciones/funciones.js'

var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post('/', jsonParser,(req, res) => test(req, res));

app.post('/login', jsonParser,(req, res) => login(req, res));

app.post('/registro', jsonParser,(req, res) => Registrar(req, res));

app.get('/info/:usuario', jsonParser,(req, res) => infouser(req, res));

app.put('/actualizaInfo', jsonParser,(req, res) => actualizaInfo(req, res));

app.put('/subirFoto', jsonParser,(req, res) => uploadfoto(req, res));

app.post('/crearAlbum', jsonParser,(req, res) => crearAlbum(req, res));

app.get('/getAlbums:usuario', jsonParser,(req, res) => getAlbumsUser(req, res));

app.put('/modificaAlbum', jsonParser,(req, res) => changeAlbums(req, res));

app.get('/getAlbum/:username/:nameAlbum', jsonParser,(req, res) => getFotosAlbum(req, res));

app.delete('/eliminaAlbum/:username/:nameAlbum', jsonParser,(req, res) => deleteAlbum(req, res));

app.get('/verFotos/:usuario', jsonParser,(req, res) => getFotosUser(req, res));

app.listen(PORT || process.env.PORT )