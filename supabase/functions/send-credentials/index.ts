import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, username, password, full_name }: RequestBody = await req.json();

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .credentials {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .credential-item {
            margin: 10px 0;
          }
          .credential-label {
            font-weight: bold;
            color: #1f2937;
          }
          .credential-value {
            font-family: monospace;
            background-color: white;
            padding: 8px;
            border-radius: 4px;
            display: inline-block;
            margin-left: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Tuition Attendance System</h1>
          </div>
          <div class="content">
            <p>Dear ${full_name},</p>
            <p>Your account has been created successfully! Below are your login credentials for the Tuition Attendance System.</p>

            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">Username:</span>
                <span class="credential-value">${username}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${password}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${email}</span>
              </div>
            </div>

            <p><strong>Please keep these credentials safe and do not share them with anyone.</strong></p>

            <p>You can now log in to mark your attendance and view your attendance history.</p>

            <p>If you have any questions or need assistance, please contact your administrator.</p>

            <p>Best regards,<br>Tuition Administration Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Sending credentials to ${email} for user ${full_name}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Credentials would be sent via email service (email service integration required)"
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
