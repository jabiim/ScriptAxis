import {PrismaClient} from '@prisma/client'

const transformDuration = index => {
    switch(index) {
        case 0:
            return 0;
        case 1:
            return 300; //5 minutes
        case 2:
            return 600; //10 minutes
        case 3:
            return 900; //15 minutes
        case 4:
            return 1200; //20 minutes
        case 5:
            return 1800; //30 minutes
        case 6:
            return 3600; //60 minutes
        case 7:
            return 7200; //120 minutes
    }
}

const QueryScripts = ({filters, sorting}) => {
    return new Promise(async (resolve, reject) => {
        const prisma = new PrismaClient({log: ["query"]});
        try {

            let finalWhere = {
                AND: [
                    {
                        active: { 
                            equals: true
                        }
                    }
                ]
            };

            console.log(filters);

            //these are set directly from UI
            if(filters.name) finalWhere.AND.push({name: filters.name});
            if(filters.category) finalWhere.AND.push({category: filters.category});

            //duration needs to be split into two checks for min and max
            if(filters.minDuration) finalWhere.AND.push({duration: {gte: transformDuration(Number(filters.minDuration))}});
            if(filters.maxDuration) finalWhere.AND.push({duration: {lte: transformDuration(Number(filters.maxDuration))}});

            if(filters.studio) finalWhere.AND.push({studio: filters.studio});

            if(filters.sourceUrl) finalWhere.AND.push({sourceUrl: filters.sourceUrl});
            if(filters.streamingUrl) finalWhere.AND.push({streamingUrl: filters.streamingUrl});

            //todo: God damn it Prisma doesn't support filtering with lists
            //see: https://github.com/prisma/prisma-client-js/issues/341
            //see: https://github.com/prisma/prisma/issues/3475
            //Until this is added, I'll need to workaround either raw SQL
            //I really don't want to do that, so I think I'll just filter them myself...

            let scripts = await prisma.script.findMany({
                where: finalWhere,
                orderBy: sorting,
                include: {
                    creator: { select: { name: true }},
                    owner: { select: { username: true }}
                }
            });

            //Filtering on the server after fetching everything, because that's how we have to do it
            //Please halp prisma team :c
            if(filters.include) scripts = scripts
                .filter(script => filters.include.reduce((acc, tag) => {
                    return acc && script.tags.findIndex(t => t === tag) !== -1;
                }, true));
            
            if(filters.exclude) scripts = scripts
                .filter(script => filters.exclude.reduce((acc, tag) => {
                    return acc && script.tags.findIndex(t => t === tag) === -1;
                }, true));

            if(filters.talent) {
                scripts = scripts
                    .filter(script => script.talent && script.talent
                        .findIndex(talent => talent.includes(filters.talent.contains)
                    ) !== -1);
            }

            await prisma.$disconnect();
            resolve(scripts);
        } catch(error) {
            await prisma.$disconnect();
            reject(error);
        }
    })
}

export {QueryScripts}

export default async (req, res) => {
    console.log("Request Body", req.body);
    try {
        const scripts = await QueryScripts(req.body);
        res.status(200);
        res.json(scripts);
    } catch(error) {
        console.error("error fetching scripts - " + error.message);
        res.json({
            error: { message: error.message }
        });
    }
};