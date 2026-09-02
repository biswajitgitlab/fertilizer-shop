<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Sarkar Fertilizer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f5;
            margin: 0;
            padding: 0;
            color: #1e293b;
        }
        .email-container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 32px 28px;
        }
        .welcome-text {
            font-size: 16px;
            line-height: 1.6;
            color: #334155;
        }
        .highlight-box {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 16px 20px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .highlight-box h3 {
            margin: 0 0 8px 0;
            color: #047857;
            font-size: 15px;
        }
        .highlight-box p {
            margin: 0;
            font-size: 14px;
            color: #065f46;
        }
        .cta-button {
            display: inline-block;
            background-color: #059669;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            font-weight: 600;
            border-radius: 8px;
            margin-top: 16px;
            text-align: center;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🌱 Welcome to Sarkar Fertilizer!</h1>
            <p>Empowering Agriculture with Premium Tech & Bio-Solutions</p>
        </div>

        <div class="content">
            <p class="welcome-text">Hello <strong>{{ $user->name }}</strong>,</p>

            <p class="welcome-text">
                Thank you for joining <strong>Sarkar Fertilizer & Agri-Tech</strong>! We are thrilled to partner with you in improving crop yields and sustainable farming.
            </p>

            <div class="highlight-box">
                <h3>🚀 Your Account Details:</h3>
                <p><strong>Email:</strong> {{ $user->email }}</p>
                <p><strong>Phone:</strong> {{ $user->phone }}</p>
                @if($user->farm_location)
                <p><strong>Farm Location:</strong> {{ $user->farm_location }}</p>
                @endif
            </div>

            <p class="welcome-text">
                Explore our wide selection of bio-stimulants, micronutrients, AI-powered crop diagnosis, and personalized crop planning tools.
            </p>

            <div style="text-align: center; margin-top: 28px;">
                <a href="{{ config('app.url') }}" class="cta-button">Explore Product Catalog</a>
            </div>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Sarkar Fertilizer & Agri-Tech. All rights reserved.</p>
            <p>Need help? Contact support at support@sarkarfertilizer.com</p>
        </div>
    </div>
</body>
</html>
