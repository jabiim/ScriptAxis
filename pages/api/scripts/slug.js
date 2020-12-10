import {PrismaClient} from '@prisma/client'

const FetchScript = (slug, noview) => {
    return new Promise(async (resolve, reject) => {
        const prisma = new PrismaClient({log: ["query"]});
        try {
            const where = {
                slug: slug,
                active: true
            };
            const include = {
                creator: { select: { name: true }},
                owner: { select: { username: true }}
            };
            const promise = noview
                ? prisma.script.findFirst({where, include})
                : prisma.script.update({where: {slug}, include, data: {
                    views: { increment: 1 }
                }});

            const scripts = await promise;
            await prisma.$disconnect();
            resolve(scripts);
        } catch(error) {
            await prisma.$disconnect();
            reject(error);
        }
    })
}

export {FetchScript}

export default async (req, res) => {
    try {
        const script = await FetchScript(req.body.slug, req.body.noview);
        res.status(200);
        res.json(script);
    } catch(error) {
        console.log("Error fetching script - " + error);
        res.status(400);
        res.json({
            error
        });
    }
};