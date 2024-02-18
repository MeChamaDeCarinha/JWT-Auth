# JSON Web Token Auth

Basic authentication API based on JSON Web Token (JWT).


## Setup project

1. Clone the repository ```git clone https://github.com/MeChamaDeCarinha/JWT-Auth.git```
2. Install required modules ```npm i```
3. Config your **.env** file based on the **.env.example**
4. Config the server port on **server.ts**


## Run project
You may need run as sudo if the server is on port 80

1. Dev mode

    ```npm run dev```

1. Production mode

    ```npm run build```

    ```npm run start```


## What is JWT

Basically JWT is a authentication method where the data is encripted on server with a secret key. 

The token has tree parts:

1. Header: 

    Contain algorithm and the token type.


    ```Javascript
    const header = {
        algorithm: "HS256",
        type: "JWT",
    }
    ```

2. Payload

    Here you can put any data that you want to share with the client and also the expiration date of the token.

    ```Javascript
    const payload = {
        id: "1",
        username: "example",
        email: "example@example.com",
        expiredAt: "1716239022",
    }
    ```

3. Verify Signature

    Here is the important part, the server encode both header and payload in Base64 then concatenates with a "." between them, after that just encrypt the result with the key on server side.

    ```Javascript
    const signature = SH256(base64(header) + "." + base64(payload), SECRET_KEY)
    ```

    The token will look like that:

    ```Javascript
    const token = header + "." + payload + "." + signature
    ```


## How it works

When user login or signin on the aplication the server generate a token and send to client who stores inside an HttpOnly cookie, any request on a protected route must have the token on Authorization header after "Bearer " as below:

```Javascript
headers = {
    "Authorization": "Bearer " + JWT
}
```

The server retrive this data and get the JWT token, then will generate another signature with the header and the payload provided by the client using the secret key and see if match with the signature that is on the last part of the token.

```Javascript
const authorization = request.headers.authorization

// Separate the token and the "Bearer " on the header
const JWT = authorization.split(" ")[1] 

const parts = JWT.split(".")

const header = parts[0]
const payload = parts[1]
const signature = parts[2]

// Header and payload already base64 encoded 
const tokenEnconded = SH256(headers + "." + payload, SECRET_KEY)

// If both equals is a valid token
return signature === tokenEnconded
```

If don't match it means that the client have modified the data and is invalid. Only the server has the key to encrypt the last part so its possible to know if has ben modified.

## Routes documentation

- ### POST: /auth/login

#### Request body: 

```Javascript
{
    "email": "example@example.com",
    "password": "password"
}
```

#### Response:

200. Return the token for the client.
400. Return the error.


- ### POST: /auth/signin

#### Request body: 

```Javascript
{
    "username": "username",
    "email": "example@example.com",
    "password": "password"
}
```

#### Response:

200. Return the token for the client.
400. Return the error.


- ### POST: /auth/validate

#### Request header: 

```Javascript
"Authorization": "Bearer " + JWT
```

#### Response:

200. Return the session for the client.
401. Invalid token.