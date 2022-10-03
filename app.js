require('dotenv').config() //to access environment variables from .env file
const express = require('express')
const bodyParser = require('body-parser')
const expressHbs = require('express-handlebars')
const path = require('path')
const nodemailer = require('nodemailer')

const app = express()

// View engine setup
app.engine(
  'hbs',
  expressHbs({
    extname: 'hbs',
    defaultLayout: false,
    layoutsDir: path.join(__dirname, 'views'),
  }),
)
app.set('view engine', 'hbs')

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')))

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// create reusable transporter object using the default SMTP transport to send mails
// use any smtp provider, e.g. gmail
let transporter = nodemailer.createTransport({
  host: 'mail.example.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_ID, // email user
    pass: process.env.EMAIL_PASSWORD, // email password
  },
  tls: {
    rejectUnauthorized: false,
  },
})
app.get('/', (req, res) => {
  res.render('contact')
})

app.post('/send', (req, res) => {
  let { name, email, phone, company, message } = req.body
  if (!name) return res.render('contact', { msg: '', error: 'Name Missing' })
  if (!email) return res.render('contact', { msg: '', error: 'email Missing' })
  if (!phone) return res.render('contact', { msg: '', error: 'phone Missing' })
  if (!company)
    return res.render('contact', { msg: '', error: 'company Missing' })
  if (!message)
    return res.render('contact', { msg: '', error: 'message Missing' })
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${name}</li>
      <li>Company: ${company}</li>
      <li>Email: ${email}</li>
      <li>Phone: ${phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${message}</p>
  `

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Nodemailer Contact" <your@email.com>', // sender address
    to: 'RECEIVEREMAILS', // receiver or list of receivers
    subject: 'Contact Request', // Subject line
    text: 'Hello world?', // plain text body
    html: output, // html body
  }

  try{
    // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, data) => {
    if (error) {
      console.log(error)
      return res.render('contact', { msg: '', error: 'Error While sending mail' })
    }
    console.log('Message sent: %s', data)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(data))
    return res.render('contact', { msg: 'Email has been sent', error: '' })
  })
  }catch(err){
    console.log(err);
    return res.render('contact', { msg: '', error: 'Error While sending mail' })
  };
});

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on port ${port}`))
