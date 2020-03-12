import sys
import cv2 as cv
import numpy as np
from PIL import Image
from matplotlib import pyplot as plt



# Extract targeted color
src = cv.imread(r'C:\Users\terry\Desktop\SDP\images\test.jpg')
hsv = cv.cvtColor(src, cv.COLOR_BGR2HSV)

# Set the targeted color boundries
lower_hsv = np.array([26, 43, 46])
upper_hsv = np.array([74, 255, 255])

mask = cv.inRange(hsv, lowerb=lower_hsv, upperb=upper_hsv)
dst = cv.bitwise_and(src, src, mask=mask)
cv.imwrite(r'C:\Users\terry\Desktop\SDP\images\extracted.jpg',mask)

print('Targeted Color Extracted')




# Transfer images to binary 
img = Image.open(r'C:\Users\terry\Desktop\SDP\images\extracted.jpg')
Img = img.convert('L')

# Set the threshold
threshold = 247

table = []
for j in range(256):
    if j < threshold:
        table.append(0)
    else:
        table.append(1)

photo = Img.point(table, '1')
photo.save(r'C:\Users\terry\Desktop\SDP\images\\binary.jpg')

print('Images Transfered To Binary')




# Cut the picture into 9 identical squares
def cut_image(image):
	width,height=image.size
	item_width=int(width/3)
	box_list=[]
	count=0

	for j in range(0,3):
		for i in range(0,3):
			count+=1
			box=(i*item_width,j*item_width,(i+1)*item_width,(j+1)*item_width)
			box_list.append(box)
	image_list=[image.crop(box) for box in box_list]
	return image_list
 
def save_images(image_list):
	index=1
	for image in image_list:
		image.save(r'C:\Users\terry\Desktop\SDP\Images\\{}.jpg'.format(index))
		index+=1

if __name__ == '__main__':
	file_path="001.jpg"
	image=Image.open(r'C:\Users\terry\Desktop\SDP\images\\binary.jpg')
	image_list=cut_image(image)
	save_images(image_list)

print('Picture Cut Into 9 Squares')




# Calculate the ratio of available area and return the instruction
ratio = []
i = 1
while(i<=9):
    img = r'C:\Users\terry\Desktop\SDP\images\\{}.jpg'.format(i)
    im=np.array(Image.open(img).convert('RGB'))
    white = [255,255,255]
    black = [0, 0, 0]
    image = cv.imread(img)
    hight, width, _ = image.shape
    size = hight * width
    b = np.count_nonzero(np.all(im==black,axis=2))
    ratio.append(b/size)
    i += 1

print(ratio)

def instruction():
    threshold = 0.8
    if(ratio[4]>=threshold):
        return 'Please stab here'
    else:
        for j in range(1,10):
            if(ratio[j-1]>=threshold):
                return 'Please stab at grid {}'.format(j)
    return 'Cannot find a suitable grid to stab'
                
print(instruction())