import { Hash, createHash, getHashes } from "crypto";

export class User {

constructor(
  protected username:string=null,
  protected password:string=null,
  protected authToken:string=null,
  protected name:string=null,
  protected id=null
  ){}

  setUsername(username){
    this.username = username;
    return this;
  }

  getUsername(){
    return this.username;
  }

  setPassword(password){
    this.password = password;
    return this;
  }

  getAuthToken(){
    return this.authToken;
  }

  setAuthToken(authToken){
    this.authToken = authToken;
    return this;
  }

  getName(){
    return this.name;
  }

  setName(name){
    this.name = name;
    return this;
  }

  getId(){
    return this.id;
  }

  setId(id){
    this.id = id;
    return this;
  }

}
