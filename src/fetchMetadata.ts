interface IMetadata {
    [key: string]: string | null;
}

class MetadataHandler {
    metadata: IMetadata;  // Here we define the metadata property

    constructor(metadata: IMetadata) {
        this.metadata = metadata
    }

    element(element: Element) {
        if (element.tagName == "meta") {
            let property = element.getAttribute("property");
            let content = element.getAttribute("content");
            if (property && content) {
                this.metadata[property] = content;
            }
        }

        if (element.tagName === 'link' && element.getAttribute('rel') === 'icon') {
            console.log('favicon found')
            this.metadata['favicon'] = element.getAttribute('href');
        } else if (element.tagName === 'link' && element.getAttribute('rel') === 'apple-touch-icon') {
            this.metadata['touch-icon'] = element.getAttribute('href');
        } else if (element.tagName === 'link' && element.getAttribute('rel') === 'shortcut icon') {
            this.metadata['faviconUrl'] = element.getAttribute('href');
        }
    }
}

export const getUrlMetadata = async (url: string) => {
    const res = await fetch(url);
    let metadata: IMetadata = {};  // explicitly declaring metadata object
    const handler = new MetadataHandler(metadata);

    const transformedRes = new HTMLRewriter().on('head > *', handler).transform(res);
    await transformedRes.text();  // force streaming to complete

    const siteName = metadata['og:site_name'] || metadata['twitter:site'];
    const title = metadata['og:title'] || metadata['twitter:title'];
    const description = metadata['og:description'] || metadata['twitter:description'];
    const imageUrl = metadata['og:image'] || metadata['twitter:image'];
    let faviconUrl = metadata['favicon'];
    const touchIconUrl = metadata['touch-icon'];
    const screenshotUrl = metadata['screenshot'];
    const videoUrl = metadata['og:video'] || metadata['twitter:player:stream'];
    const audioUrl = metadata['og:audio'];

    const siteVideoUrl = metadata['og:video:url'] || metadata['og:video:secure_url'] || metadata['twitter:player:stream:content_type'];

    // if icon url is not absolute, make it absolute
    if (faviconUrl && !faviconUrl.startsWith('http')) {
        faviconUrl = new URL(faviconUrl, url).toString();
    }

    return {
        url,
        title,
        description,
        siteName,
        siteVideoUrl,
        imageUrl,
        audioUrl,
        videoUrl,
        faviconUrl,
        touchIconUrl,
        screenshotUrl,
    }
}