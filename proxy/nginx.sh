cd ~
mkdir -p src && cd src
wget http://nginx.org/download/nginx-1.27.3.tar.gz
tar xzf nginx-1.27.3.tar.gz
cd nginx-1.27.3

./configure --prefix=$HOME/nginx-local --without-http_gzip_module
make
make install
