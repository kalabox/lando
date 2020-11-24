server {
    listen 80 default_server;
    listen 443 ssl http2;

    server_name localhost;
    root "{{LANDO_WEBROOT}}";
    index index.php index.html index.htm;

    port_in_redirect off;

    # Enable serving of static gzip files as per: http://nginx.org/en/docs/http/ngx_http_gzip_static_module.html
    gzip_static  on;

    # Enable server-side includes as per: http://nginx.org/en/docs/http/ngx_http_ssi_module.html
    ssi on;

    # Disable limits on the maximum allowed size of the client request body
    client_max_body_size 0;

    # 404 error handler
    error_page 404 /index.php?$query_string;

    location / {
        try_files $uri/index.html $uri $uri/ /index.php?$query_string;
    }

    location ~ [^/]\.php(/|$) {
        try_files $uri $uri/ /index.php?$query_string;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass fpm:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        # Don't allow browser caching of dynamically generated content
        add_header Last-Modified $date_gmt;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        if_modified_since off;
        expires off;
        etag off;

        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }

    ssl_certificate           /certs/cert.crt;
    ssl_certificate_key       /certs/cert.key;
    ssl_verify_client         off;
    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    # Misc settings
    sendfile off;
}
