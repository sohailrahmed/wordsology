import numpy as np
from PIL import Image
import sys, os; src=os.path.join(os.path.dirname(__file__), '../../public/media/questions/micropic1.png')
a=np.array(Image.open(src).convert('RGB')).copy()
# erase the old text (question block + "animal pee borne"); it is redrawn as sharp text on top
a[12:88, 20:262] = 255
a[165:232, 88:147] = 255
def scale2x(img):
    h,w,_=img.shape
    p=np.pad(img,((1,1),(1,1),(0,0)),mode='edge')
    E=p[1:-1,1:-1]; B=p[:-2,1:-1]; D=p[1:-1,:-2]; F=p[1:-1,2:]; Hh=p[2:,1:-1]
    eq=lambda x,y: np.all(x==y,axis=2)
    cond=(~eq(B,Hh)) & (~eq(D,F))
    out=np.zeros((h*2,w*2,3),dtype=img.dtype)
    out[0::2,0::2]=np.where((cond&eq(D,B))[...,None],D,E)
    out[0::2,1::2]=np.where((cond&eq(B,F))[...,None],F,E)
    out[1::2,0::2]=np.where((cond&eq(D,Hh))[...,None],D,E)
    out[1::2,1::2]=np.where((cond&eq(Hh,F))[...,None],F,E)
    return out
b=a
for _ in range(3): b=scale2x(b)          # 8x, pixel-art aware
img=Image.fromarray(b).resize((1200,1200),Image.LANCZOS)   # back to 4x with smooth edges
img.save(os.path.join(os.path.dirname(__file__), 'micro_4x.png'),optimize=True)
print(img.size)
