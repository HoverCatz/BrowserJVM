[![wakatime](https://wakatime.com/badge/user/6e87c2b1-00e5-48ff-98b5-35a00438ef4f/project/bb4b9644-ee11-4c70-b507-1e1376130440.svg)](https://wakatime.com/badge/user/6e87c2b1-00e5-48ff-98b5-35a00438ef4f/project/bb4b9644-ee11-4c70-b507-1e1376130440)

# BrowserJVM

Please don't use this for production.  
The project is very unstable. It can run simple java instructions, but there are still a lot of bugs and untested code.  
The java compiler part also doesn't compile instructions yet, only class-data, field and function information. Still actively working on it.  
Currently only supports Java 7 (and below) - so no Java 8 (and above) functionality will work.

## What is this?

This is java - in the browser! Natively. No dependencies. Will also support semi-old versions of IE (probably).  
When this project is completed, anyone will be able to write Java Source Code in the browser, compile it in the browser, and execute it in the browser - all without a server! This is fully client-sided and only requires the built-in javascript in most browsers. No need to install anything.

Features:
- Javac (java compiler)
- - From java source code, to .class file
- Java (java runtime)
- - From .class file, to executable instructions
- ASM (https://asm.ow2.io/)
- - Reading class files
- - Writing class files

Non-supported features (might come later):
- Threads (can be done using setInterval)
- IO (File system) (can be simulated)
- Guis (can be shown as virtual windows on webpage)
- Networking (can be done using a chrome extension)
- Lambdas
- Natives

## Why?
Because I want to prove to myself what I can and can not do in programming.

## Notice
The whole project is currently just one big mess. There is mixed code everywhere, and I will clean it up when I get closer to a working end result. I am trying to keep this compact, as not to create a bunch of .js files when only very few are needed.
