<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> Web Feed</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <link rel="stylesheet" href="/rss/styles.css"/>
      </head>
      <body class="bg-white">
        <nav class="container-md px-3 pt-2 mt-2 mt-md-5 mb-5 markdown-body">
          <p class="bg-yellow-light ml-n1 px-1 py-1 mb-1">
            <strong>This is a web feed,</strong> also known as an RSS feed. <strong>Subscribe</strong> by copying the URL from the address bar into your newsreader.
          </p>
          <p class="text-gray">
            Visit <a href="https://aboutfeeds.com">About Feeds</a> to get started with newsreaders and subscribing. It’s free.
          </p>
        </nav>
        <div class="container-md px-3 py-3 markdown-body">
          <header class="pt-2 pb-5">
            <h1 class="border-0">
              RSS Feed
            </h1>
            <h2><xsl:value-of select="/rss/channel/title"/></h2>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <a class="head_link" target="_blank">
              <xsl:attribute name="href">
                <xsl:value-of select="/rss/channel/link"/>
              </xsl:attribute>
              Visit Website &#x2192;
            </a>
          </header>
          <h2>Recent Posts</h2>
          <xsl:for-each select="/rss/channel/item">
            <div class="pb-5">
              <h3 class="mb-0">
                <a target="_blank">
                  <xsl:attribute name="href">
                    <xsl:value-of select="link"/>
                  </xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h3>
              <small class="text-gray">
                Published: <xsl:value-of select="pubDate" />
              </small>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
