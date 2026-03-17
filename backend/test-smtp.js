const nodemailer = require('nodemailer');

async function testSMTP() {
  console.log('🧪 Testing SMTP connection...');
  
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('📡 SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPass: !!process.env.SMTP_PASS,
    });

    await transport.verify();
    console.log('✅ SMTP connection successful!');
    
    const result = await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: 'test@example.com',
      subject: 'Test Email from AppCitas',
      text: 'This is a test email from the booking system.',
    });
    
    console.log('✅ Test email sent:', result);
    
  } catch (error) {
    console.error('❌ SMTP Test failed:', error);
  } finally {
    transport.close();
  }
}

testSMTP();
