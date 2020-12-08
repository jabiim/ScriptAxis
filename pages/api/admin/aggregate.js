import {PrismaClient} from '@prisma/client'

const Aggregate = () => {
    return new Promise(async (resolve, reject) => {
        const prisma = new PrismaClient({log: ["query"]});

        const updateCreator = creator => {
            return new Promise(async (resolve, reject) => {
                try {
                    const aggregations = await prisma.script.aggregate({
                        where: {
                            creator: {
                                name: creator.name
                            }
                        },
                        sum: {
                            views: true,
                            likeCount: true
                        }
                    });
                    const updatedCreator = await prisma.creator.update({
                        where: {
                            name: creator.name
                        },
                        data: {
                            totalViews: aggregations.sum.views,
                            totalLikes: aggregations.sum.likeCount,
                        }
                    });
                    resolve(updatedCreator);
                } catch(error) {
                    reject(error);
                }
            })
        }

        try {
            const creators = await prisma.creator.findMany();
            const output = await Promise.all(creators.map(creator => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const updatedCreator = await updateCreator(creator);
                        resolve(updatedCreator);
                    } catch(error) {
                        reject(error);
                    }
                })
            }))
            resolve(output);
        } catch(error) {
            await prisma.$disconnect();
            reject(error);
        }
    })
}

export {Aggregate}

export default async (req, res) => {
    try {
        const scripts = await Aggregate();
        res.status(200);
        res.json(scripts);
    } catch(error) {
        console.log("Error fetching tags and categories - " + error);
        res.status(400);
        res.json({
            error
        });
    }
};