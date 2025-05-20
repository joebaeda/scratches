export async function GET() {

    const config = {
        accountAssociation: {
            header: "eyJmaWQiOjk1MDY4OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGJBNWVkNjVERjdGMzgyNWZEODk4NzQ5MTk0YjA3MTEyQzIwOWQxOWEifQ",
            payload: "eyJkb21haW4iOiJzY3JhdGNoZXMudmVyY2VsLmFwcCJ9",
            signature: "MHg2MmVhZTBjMTllNTQ4YWUyMzNhOWQwYTA5ZDhiYjQ5N2M0NzQxMjA4NWRkN2JjNDljY2I2YmFkMmVhOTJmZmM2M2NlODZmYTUwNGE2N2ZjMGU5ZjBiYmYzYTU1MDhkOTdkNzM1YjhiYTFjNmUwZTQ1Njk5ZDUxOTM1OGFkYmZlMDFj"
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