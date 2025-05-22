export async function GET() {

    const config = {
        accountAssociation: {
            header: "eyJmaWQiOjk1MDY4OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDc1ODFCMzMzMDQ1ZDBiNjBjOGQwOWRiYkFjQThEQjg2MmVhOTE4MjgifQ",
            payload: "eyJkb21haW4iOiJzY3JhdGNoZXMudmVyY2VsLmFwcCJ9",
            signature: "MHhkZTgxODNiOTI0NWZhZDQwOTNkNDFiYzM3ZTBmNWI1MjA2ZGFkYmRkZDA1ZTQwNmI0MjY0OTAxYmEyNmVhOGI1M2UzM2M0YTI3NGJmODJmNWUxNjA0NGZhMDFkOGQ1MTVjZGNhOTg4YWE5ZDg0Y2IwNWI2N2M4ZWUwZDBmZDM2OTFj"
        },
        frame: {
            version: "1",
            name: "scratches",
            iconUrl: "https://scratches.vercel.app/scratch.png",
            homeUrl: "https://scratches.vercel.app",
            imageUrl: "https://scratches.vercel.app/og-image.jpg",
            buttonTitle: "let's scratching!",
            splashImageUrl: "https://scratches.vercel.app/splash.svg",
            splashBackgroundColor: "#ede4ca",
            webhookUrl: "https://scratches.vercel.app/api/webhook"
        }
    };

    return Response.json(config);
}
