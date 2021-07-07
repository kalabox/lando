---
description: Add a highly configurable Apache Solr service to Lando for local development with all the power of Docker and Docker Compose.
---

# Solr

[Solr](http://lucene.apache.org/solr/) is highly reliable, scalable and fault tolerant, providing distributed indexing, replication and load-balanced querying, automated failover and recovery, centralized configuration and more. Solr powers the search and navigation features of many of the world's largest internet sites.

You can easily add it to your Lando app by adding an entry to the [services](./../config/services.md) top-level config in your [Landofile](./../config/lando.md).

[[toc]]

## Supported versions

*   [8](https://hub.docker.com/r/_/solr/)
*   [8.6](https://hub.docker.com/r/_/solr/)
*   [8.5](https://hub.docker.com/r/_/solr/)
*   [8.4](https://hub.docker.com/r/_/solr/)
*   [8.3](https://hub.docker.com/r/_/solr/)
*   [8.2](https://hub.docker.com/r/_/solr/)
*   [8.1](https://hub.docker.com/r/_/solr/)
*   [8.0](https://hub.docker.com/r/_/solr/)
*   **[7](https://hub.docker.com/r/_/solr/)** **(default)**
*   [7.7](https://hub.docker.com/r/_/solr/)
*   [7.6](https://hub.docker.com/r/_/solr/)
*   [custom](./../config/services.md#advanced)

## Legacy versions

You can still run these versions with Lando but for all intents and purposes they should be considered deprecated (e.g. YMMV and do not expect a ton of support if you have an issue).

*   [6.6](https://hub.docker.com/r/_/solr/)
*   [6](https://hub.docker.com/r/_/solr/)
*   [5.5](https://hub.docker.com/r/_/solr/)
*   [5](https://hub.docker.com/r/_/solr/)
*   [4](https://hub.docker.com/r/actency/docker-solr)
*   [4.10](https://hub.docker.com/r/actency/docker-solr)
*   [3](https://hub.docker.com/r/actency/docker-solr)
*   [3.6](https://hub.docker.com/r/actency/docker-solr)

## Patch versions

::: warning Not officially supported!
While we allow users to specify patch versions for this service, they are not *officially* supported, so if you use one, YMMV. Also note that patch versions are not available for Solr 3.x and 4.x.
:::

To use a patch version, you can do something as shown below:

```yaml
services:
  myservice:
    type: solr:5.5.5
```

But make sure you use one of the available [patch tags](https://hub.docker.com/r/library/solr/tags/) for the underlying image we are using.

## Configuration

Here are the configuration options, set to the default values, for this service. If you are unsure about where this goes or what this means, we *highly recommend* scanning the [services documentation](./../config/services.md) to get a good handle on how the magicks work.

Also note that options, in addition to the [build steps](./../config/services.md#build-steps) and [overrides](./../config/services.md#overrides) that are available to every service, are shown below:

```yaml
services:
  myservice:
    type: solr:7
    portforward: false
    core: lando
    config:
      conf: SEE BELOW
```

### Port forwarding

`portforward` will allow you to access this service externally by assigning a port directly on your host's `localhost`. Note that `portforward` can be set to either `true` or a specific `port` but we *highly recommend* you set it to `true` unless you have pretty good knowledge of how port assignment works or you have a **very** compelling reason for needing a locked down port.

`portforward: true` will prevent inevitable port collisions and provide greater reliability and stability across Lando apps. That said, one downside of `portforward: true` is that Docker will assign a different port every time you restart your application. You can read more about accessing services externally [over here](./../guides/external-access.md).

`tl;dr`

**Recommended**

```yaml
services:
  myservice:
    type: solr
    portforward: true
```

**Not recommended**

```yaml
services:
  myservice:
    type: solr
    portforward: 8983
```

### Using a custom core

You can easily set up a different core name with the `core` config value.

```yaml
services:
  myservice:
    type: solr
    core: my-core
```

::: warning Solr 5+ only!
The `core` config value does not work for Solr 3.x or 4.x.
:::

### Using custom solr config

You will almost certainly need to utilize your own custom Solr config. You can do that by telling Lando to inject solr config from a directory inside of your application.

Consider a Drupal 8 application injecting the Solr 7.x config directly from the `search_api_solr` module as shown in the example below:

**A hypothetical project**

Note that you can put your configuration files anywhere inside your application directory. We use a `config` directory but you can call it whatever you want such as `.lando` in the example below:

```bash
./
|-- sites/all/modules/search_api_solr/solr-conf/7.x
   |-- elevate.xml
   |-- mapping-ISOLatin1Accent.txt
   |-- protwords.txt
   |-- schema_extra_fields.xml
   |-- schema_extra_types.xml
   |-- schema.xml
   |-- solrconfig_extra.xml
   |-- solrconfig_index.xml
   |-- solrconfig_spellcheck.xml
   |-- solrconfig.xml
   |-- solrcore.properties
   |-- stopwords.txt
   |-- synonyms.txt
|-- .lando.yml
```

**Landofile's solr config**

```yaml
services:
  myservice:
    type: solr
    config:
      conf: sites/all/modules/search_api_solr/solr-conf/7.x
```

## Getting information

You can get connection and credential information about your solr instance by running [`lando info`](./../cli/info.md). It may also be worth checking out our [accessing services externally guide](./../guides/external-access.md).

<RelatedGuides tag="Solr"/>
