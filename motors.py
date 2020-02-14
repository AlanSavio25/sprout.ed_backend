from motors import Motors
from time import time, sleep

mc = Motors()

motor_id = 0
speed = 100
run_time = 2

mc.move_motor(motor_id,speed)
start_time = time()
