import socket
import sys
from thread import start_new_thread
import threading
HOST = '' # all availabe interfaces
PORT = 5005 # arbitrary non privileged port 
lock = threading.Lock()
all_clients = []
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
except socket.error, msg:
    print("Could not create socket. Error Code: ", str(msg[0]), "Error: ", msg[1])
    sys.exit(0)

print("[-] Socket Created")

# bind socket
try:
    s.bind((HOST, PORT))
    print("[-] Socket Bound to port " + str(PORT))
except socket.error, msg:
    print("Bind Failed. Error Code: {} Error: {}".format(str(msg[0]), msg[1]))
    sys.exit()

s.listen(10)
print("Listening...")

# The code below is what you're looking for ############

def client_thread(conn):
    conn.send("Welcome to the Server. Type messages and press enter to send.\n")

    while True:
        data = conn.recv(1024)
        if not data:
            break
        reply = "OK . . " + data
        conn.sendall(reply)
        for c in all_clients:
            try:
                c.sendall(reply)
            except:
                print("Client Message not sent. The following client is dead: ")
                print(c)
    conn.close()

while True:
    # blocking call, waits to accept a connection
    conn, addr = s.accept()

    #all_clients.append(conn)
    #quick fix to allow frequent disconnections of ev3
    #if(len(all_clients)==2):
     #   all_clients[0]=conn
    #else:
    all_clients.append(conn)
    print("length of all_clients is:"+ str(len(all_clients)) )
    print("new conn is: ")
    print(conn)
    print("[-] Connected to " + addr[0] + ":" + str(addr[1]))

    start_new_thread(client_thread, (conn,))

s.close()
