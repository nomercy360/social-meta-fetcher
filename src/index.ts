import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {getUrlMetadata} from "./fetchMetadata";

type Bindings = {
    URL_METADATA: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
}))

app.get('/urlrichdata/:url', async (c, next) => {
    const url = c.req.param('url')

    console.log(url)


    // check if url address is chess.com
    // there will be another integrations soon
    if (url.includes('chess.com')) {
        // last thing in url is username
        let username = url.split('/').pop()

        if (!username) {
            return c.json({error: 'No username found in url'})
        }

        // get url metadata
        const metadata = await c.env.URL_METADATA.getWithMetadata(username, 'json')

        // if metadata is not in KV, fetch it and store it in KV
        if (!metadata.value) {
            try {
                const [statsRes, userRes] = await Promise.all([
                    fetchJoinedDate(username),
                    fetchStats(username)
                ])

                const joinedDate = statsRes
                const stats = userRes

                const metadata = {
                    joinedDate,
                    stats,
                    username
                }

                await c.env.URL_METADATA.put(username, JSON.stringify(metadata), {
                    metadata: {
                        type: 'json'
                    }
                })

                return c.json(metadata)

            } catch (e) {
                return c.json({error: 'Error fetching user data'})
            }
        }

        // return metadata from KV
        return c.json(metadata.value)
    }
})


app.get('/urlmetadata/:url', async (c, next) => {
    const url = c.req.param('url')

    // check in cache
    const metadata = await c.env.URL_METADATA.getWithMetadata(url, 'json')

    if (!metadata.value) {
        const res = await getUrlMetadata(url)

        await c.env.URL_METADATA.put(url, JSON.stringify(res), {
            metadata: {
                type: 'json'
            }
        })

        return c.json(res)
    }


    return c.json(metadata.value)
})


const fetchJoinedDate = async (username: string) => {
    let userUrl = `https://www.chess.com/callback/user/popup/${username}`

    const res = await fetch(userUrl)

    if (!res.ok) {
        throw new Error('Error fetching user data')
    }

    const json = await res.json() as any

    return new Date(json.joinDate).getTime()
}

const fetchStats = async (username: string) => {
    let statsUrl = `https://www.chess.com/callback/member/stats/${username}`

    const res = await fetch(statsUrl)

    if (!res.ok) {
        throw new Error('Error fetching user data')
    }

    let resp = await res.json() as any


    const rapid = resp.stats.filter((s: any) => s.key === 'rapid')[0]

    return {
        rating: rapid.stats.rating,
        games: rapid.stats.total_game_count,
    }
}


export default app
