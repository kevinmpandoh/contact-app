require("./utils/db");
const Contact = require("./model/contact");
const express = require("express");
const expressLayouts = require("express-ejs-layouts")

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require("connect-flash");

const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');

const app = express()
const port = 3000

// Setup method override
app.use(methodOverride("_method"));

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts)
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}));

// Konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash());

// Halaman Home
app.get('/', (req, res) => {
    
    res.render('index', { 
        nama: "Kevin Pandoh",
        title: "Halaman Home",
        layout: "layouts/main-layout", 
        
    });
    
})

// Halaman Contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();
    res.render('contact', {
        title: "Halaman Contact",
        layout: "layouts/main-layout",
        contacts,
        msg: req.flash('msg')
    });
})

// Halaman tambah contact
app.get('/contact/add', (req, res) => {    
    res.render('add-contact', {
        title: "Halaman Tambah Contact",
        layout: "layouts/main-layout",        
    });
})

// Proses tambah data contact
app.post('/contact', [
    body('nama').custom( async (value) => {

        // Cek apakah ada nama yang sama
        const duplikat = await Contact.findOne({ nama: value });
        if(duplikat) {
            throw new Error("Nama Contact sudah terdaftar");
        }

        return true;
    }),
    // Validasi Email dan Nohp
    check('email', "Email tidak valid").isEmail(),
    check('nohp', "No HP tidak valid").isMobilePhone('id-ID')
], (req,res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title: "Form Tambah Contact",
            layout: "layouts/main-layout",
            errors: errors.array(),      
        });
    } else {
        // Insert data ke database
        Contact.insertMany(req.body, (error, resault) => {
        // Kirimkan flash message
        req.flash('msg', "Data contact berhasil ditambahkan");
        res.redirect('/contact')
    })
    }

})

// Proses delete contact
app.delete('/contact/', async (req,res) => {
    
    Contact.deleteOne({ _id: req.body._id}).then((result) => {
        // Kirimkan flash message
        req.flash('msg', "Data contact berhasil dihapus");
        res.redirect('/contact')
    })
})

// Halaman Ubah Contact
app.get('/contact/edit/:_id', async (req, res) => {    
    const contact = await Contact.findOne({ _id: req.params._id });
    res.render('edit-contact', {
        title: "Halaman Ubah Contact",
        layout: "layouts/main-layout",        
        contact
    });
})

// Proses Ubah Contact
app.put('/contact', [
    body('nama').custom( async (value, {req}) => {
        const duplikat = await Contact.findOne({ nama: value });
        if(value !== req.body.oldNama && duplikat) {
            throw new Error("Nama Contact sudah terdaftar");
        }
        return true;
    }),
    // Validasi Email dan NoHP
    check('email', "Email tidak valid").isEmail(),
    check('nohp', "No HP tidak valid").isMobilePhone('id-ID')
], (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            title: "Form Ubah Contact",
            layout: "layouts/main-layout",
            errors: errors.array(),
            contact: req.body
        });
    } else {

        // Update data contack di database
        Contact.updateOne(
            { _id: req.body._id}, 
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp
                }
            }
        ).then((result) => {
            // Kirimkan flash message
            req.flash('msg', "Data contact berhasil diedit");
            res.redirect('/contact')
        })
    }

})

// Halaman detail kontak
app.get('/contact/:_id', async (req, res) => {    
    const contact = await Contact.findOne({ _id: req.params._id});

    res.render('detail', {
        title: "Halaman Detail Contact",
        layout: "layouts/main-layout",
        contact,      
    });
})

app.use('/', (req,res) => {
    res.status(404)
    res.render("404", {
        title: "404",
        layout: "layouts/main-layout",            
    });
})

app.listen(port, () => {
    console.log(`Server sedang berjalan di http://localhost:${port}`)
})

