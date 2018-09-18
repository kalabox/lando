DNS Rebinding Protection
========================

If you are using [Lando proxying](./../config/proxy.md) (which is enabled by default) some Routers and Firewalls may prevent Lando from properly routing `yourapp.lndo.site` to your local environment through [DNS Rebinding](https://en.wikipedia.org/wiki/DNS_rebinding) protection. DD-WRT router firmware enables this protection by default.

If you are seeing failed URLs (they show up in red) after app start up and you are unable to look up the url (`nslookup <sitename>.lndo.site`), DNS rebinding protection may be the cause. We recommend you consult your router documentation or system administrator to whitelist `*.lndo.site` domains.

If you can't or don't want to remove this protection, you can alternatively:

1.  Use the steps in [Working Offline](./../config/proxy.html#working-offline-or-using-custom-domains) to bypass.
2.  [Disable proxying](./../config/proxy.html#configuration) and rely on the Lando produced `localhost` address.

Note: Newer versions of Lando will strip the dashes in your application name to create the url. If you have a project that was built with an old version of Lando and had dashes on the url the issue may be caused by this. For example, if you set the option trusted_hosts_patters on Drupal with the url with dashes you'll have issues when trying to run with lando.
