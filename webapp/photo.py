import pygame, sys
from pygame.locals import *
import pygame.camera

pygame.init()
pygame.camera.init()

def clickPhoto():
    cam = pygame.camera.Camera("/dev/video0",(352,288))
    cam.start()
    image = cam.get_image()
    pygame.image.save(image,'/home/pi/webapp/static/plant.jpg')
    cam.stop()

clickPhoto()
