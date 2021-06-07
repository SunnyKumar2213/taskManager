const sendGridApiKey="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";
const sgMail=require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail=(email , name)=>{

    sgMail.send({
        to:email,
        from:email,
        subject:"Welocome to the app",
        text:"Welcome to the app '${name}' let me know how you get along with the app"
    });
}
const UnsubscribeAccountEmail=(email , name)=>{

    sgMail.send({
        to:email,
        from:email,
        subject:"Account have be remove",
        text:"Your account has been remove for app , sorry for incovience, let us know if you face any problem"
    });
}

module.exports={
    sendWelcomeEmail,
    UnsubscribeAccountEmail
}
