export async function GET() {

    const config = {
        accountAssociation: {
            header: "eyJmaWQiOjg5MTkxNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDRmYzg1YjUzN2FkYzE4RmYzNTRhMzJDNkUxM0JCRGNEZDk0YTZEMDEifQ",
            payload: "eyJkb21haW4iOiJzY3JhdGNoZXMudmVyY2VsLmFwcCJ9",
            signature: "MHgxMGZkNTVlNGQwNDA0MmU2M2Q3NjdjZGZjMTRhMmJhYmFhYjE5Y2JkNjQ1OGVhMjFmMWE3YTM0ZDMzZjlkZTMxMWM5N2Y1M2RjZjA1MzhiNmM1NTc0MGMwZDVlYzMwMDg1MDE5ODA3MGI2MDJjYTFkM2ZkMjBiZTE0ODQxNTUxMzFi"
        },
        frame: {
            version: "1",
            name: "Scratches 🖌 Scratch of Art",
            iconUrl: "https://scratches.vercel.app/scratch.png",
            homeUrl: "https://scratches.vercel.app",
            imageUrl: "https://scratches.vercel.app/og-image.jpg",
            buttonTitle: "Let's Scratching!",
            splashImageUrl: "https://scratches.vercel.app/splash.svg",
            splashBackgroundColor: "#ede4ca",
            webhookUrl: "https://scratches.vercel.app/api/webhook"
        }
    };

    return Response.json(config);
}