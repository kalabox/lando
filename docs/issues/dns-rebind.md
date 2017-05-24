DNS Rebinding Protection
------------------------

Some Routers and Firewalls may prevent Lando from properly routing `yourapp.lndo.site` to your local environment through [DNS Rebinding](https://en.wikipedia.org/wiki/DNS_rebinding) protection. DD-WRT router firmware enables this protection by default.

If you are seeing failed URLs (they show up in red) after app start up and you are unable to look up the url (`nslookup <sitename>.lndo.site)`), DNS rebinding protection may be the cause. We recommend you consult your router documentation or system administrator to whitelist `*.lndo.site` domains.

If you can't or don't want to remove this protection, you can use the steps in [Working Offline](./../config/proxy.html#working-offline-or-using-custom-domains) to bypass.
