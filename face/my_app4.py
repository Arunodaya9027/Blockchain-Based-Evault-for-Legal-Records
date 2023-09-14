from uu import encode
from flask import Flask, render_template, request, Response, jsonify
import cv2
import numpy as np
import base64
import face_recognition
import os
from datetime import datetime
import json
import time
import dlib
import mysql.connector

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="ankita",
    auth_plugin='mysql_native_password'
)

mycursor = mydb.cursor()

app = Flask(__name__)

# Load the face cascade classifier
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')
face_classifier = face_cascade
predictor_path = "shape_predictor_68_face_landmarks.dat"
predictor = dlib.shape_predictor(predictor_path)

# Load the face detector model
detector = dlib.get_frontal_face_detector()

def flatten_list(nested_list):
    if isinstance(nested_list, list):
        flattened = []
        for sublist in nested_list:
            if isinstance(sublist, list):
                flattened.extend(sublist)
            else:
                flattened.append(sublist)
        return flattened
    else:
        return [nested_list]

def showcount(c,l,r):
    dic = {}
    dic["center"]= c
    dic["left"]= l
    dic["right"] = r
    return dic

def face_extractor(img):
    
    gray = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray,1.3,5)

    if faces is():
        return None

    for(x,y,w,h) in faces:
        cropped_face = img[y:y+h, x:x+w]

    return cropped_face


# def saveFrame(name,c,frame):
#         print("frame rec")
#         face = cv2.resize(face_extractor(frame),(200,200))
#         encodeImg = face_recognition.face_encodings(frame)
#         if len(encodeImg) != 0:
#             pname = name+"_"+str(c)
#             mydic[pname] = encodeImg[0].tolist()
#         return "OK"

def getCount(roll):
    try:
        with open('temp/'+str(roll)+'.json', 'r') as f:
          data = json.load(f)
    except FileNotFoundError:
        data = {}
        data["ccount"]=0
        data["lcount"]=0
        data["rcount"]=0
        data["frames"]=[]
    return data

def updateCounts(c,l,r,roll,allframe,nframe):
    face = cv2.resize(face_extractor(nframe),(200,200))
    #face = cv2.cvtColor(face, cv2.COLOR_BGR2GRAY)
    encodeImg = face_recognition.face_encodings(nframe)
    if len(encodeImg) == 0:
            return"FAILED"
    else:
            
            allframe.append(encodeImg[0].tolist())
            #allframe = allframe[0]
       
            counts = {}
           

            counts["ccount"]=c
            counts["lcount"]=l
            counts["rcount"]=r
            counts["frames"] = allframe
           
            with open('temp/'+str(roll)+'.json', 'w') as json_file:
                json.dump(counts, json_file)

            return "OK"


# def face_detector(img, size = 0.5):
    
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     faces = face_classifier.detectMultiScale(gray,1.3,5)

#     if faces is():
#         return img,[]

#     for(x,y,w,h) in faces:
#         cv2.rectangle(img, (x,y),(x+w,y+h),(0,255,0),2)
#         roi = img[y:y+h, x:x+w]
#         roi = cv2.resize(roi, (200,200))

#     return img,roi


def addUserFaces(roll):
    with open('models/user_faces.json', 'r') as f:
          data = json.load(f)

    with open('temp/'+str(roll)+'.json', 'r') as f:
          data2 = json.load(f)
    
    data[roll]=data2["frames"]

    with open('models/user_faces.json', 'w') as json_file:
                json.dump(data, json_file)

    return "OK"


def deleteJSON(roll):
    os.remove('temp/'+roll+".json")
# Load the known face encodings and names


def getStudentsBatch(batch):
    query = "SELECT name,roll from studentsa WHERE dataset=1 and batch='"+batch+"'"
    
    mycursor.execute(query)
    results = mycursor.fetchall()

    my_results = {}

    # The returned data will be a list of tuples
    for i in range(0, len(results)):
        name = results[i][0]
        roll = results[i][1]

        my_results[roll] = name

   
    
    return my_results


def UpdateFaceSql(roll):
    query = "UPDATE studentsa SET dataset=1 WHERE roll='"+roll+"'"
    try:
        # Execute the query
        mycursor.execute(query)

        # Commit changes
        mydb.commit()

        return("Query executed successfully.")
    except Exception as e:
        return("Error executing query:", e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/StartFaceReg')
def StartFaceReg():
    return render_template('facereg.html')


@app.route('/initiateUsers')
def initiate():
    batch = request.args.get('batch')
    lecid = request.args.get('lec_id')
    if not batch:
        return "BATCH NOT PRESENT"
    
    if not lecid:
        return "LEC_ID NOT PRESENT"
    
    query = "SELECT name, roll,dataset FROM studentsA WHERE batch='"+batch+"'"
    mycursor.execute(query)
    results = mycursor.fetchall()

    students = {}

    # The returned data will be a list of tuples
    for i in range(0, len(results)):
        name = results[i][0]
        roll = results[i][1]
        if(results[i][2]==0):
            attendance = "FACE NOT PRESENT"
        else:
            attendance = "A"

        students[roll] = {"name": name, "attendance": attendance}

    with open('tempAttendance/'+lecid+'.json', 'w') as json_file:
        json.dump(students, json_file, indent=4)
    
    return json.dumps(students, indent=4)

@app.route('/video_frame', methods=['POST'])
def process_video_frame():
    with open('models/user_faces.json', 'r') as f:
     user_faces = json.load(f)

    print("route was caled at", time.time())
    # Get the frame data from the request
    frame_data = request.form['frame']
    lecid = request.form["lec_id"] 
    #suppose in batch BTECH_A , fetch roll numbers from db and then get their faces values in encodeList

    with open('tempAttendance/'+lecid+'.json', 'r') as f:
     lec = json.load(f)
     
    
    roll_nos = list(lec.keys())
    if(len(roll_nos)<1):
        return ("no student present")

    
    encodeList = []
    for i in roll_nos:
        if lec[str(i)]["attendance"]=="FACE NOT PRESENT":
            
            roll_nos.remove(str(i))
            
            continue
        
        
    for i in roll_nos:
        if str(i) in user_faces:
              
                encodeList.append(user_faces[str(i)])
        else:
                return "SOMETHING WENT WRONG WHILE SCANNING FACE"
                
        
    
    names = roll_nos
    
    encodeList = flatten_list(encodeList)
   
   
    
    with open('tempAttendance/'+lecid+'.json', 'r') as json_file:
     students = json.load(json_file)
    
    # Decode the base64-encoded frame data
    frame_bytes = base64.b64decode(frame_data.split(',')[1])

    # Convert the frame bytes to a NumPy array
    frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)

    # Decode the frame array as an image
    img = cv2.imdecode(frame_array, flags=cv2.IMREAD_COLOR)

    #########################GOT CV2 FRAME HERE#############################
    print("detection was caled at", time.time())
    
    # Confidence threshold for face recognition
    confidence_threshold = 0.45 
    name = ""
    if True:
        # Convert the image to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect faces using the Haar cascade classifier
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        if len(faces)>0:
            
        # Iterate over detected faces
            for (x, y, w, h) in faces:
                # Extract the face region
                face_img = img[y:y + h, x:x + w]
                detected_names = {}
                face_img_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
                
                # Encode the face image if at least one face is detected
                face_encodings = face_recognition.face_encodings(face_img_rgb)
                if len(face_encodings) > 0:
                    
                    face_encoding = face_encodings[0]
                    
                    # Finding matches with existing images
                    
                    matches = face_recognition.compare_faces(encodeList, face_encoding)
                    face_distances = face_recognition.face_distance(encodeList, face_encoding)
                    best_match_index = np.argmin(face_distances)
                  
                    
                    if matches[best_match_index] and face_distances[best_match_index] <= confidence_threshold:
                        best_match_index = (best_match_index)//6
                        name = str(names[best_match_index])
                        
                        students[name]["attendance"]="P"
                        
                        
                        
                    else:
                       aa = 1 # unknown user

    # # Display the image in a window
    # print("detection was completed at", time.time())
    # # Convert the processed frame back to the encoded image format
    # ret, encoded_frame = cv2.imencode('.jpg', img)
    
    # # Encode the frame as base64 to send it back to the HTML page
    # encoded_frame_data = base64.b64encode(encoded_frame).decode('utf-8')

    # # Prepare the response with the processed frame
    # response = {'processed_frame': encoded_frame_data}
    # print("route was completed at", time.time())
    # return encoded_frame_data


    with open('tempAttendance/'+lecid+'.json', 'w') as json_file:
        json.dump(students, json_file, indent=4)
    student = {}
    student[0] = students
    student[1] = name
    return jsonify(student)


@app.route('/CheckUserDetails', methods=['GET'])
def check_user_details():
    roll = request.args.get('roll')
    query = "SELECT * FROM studentsa WHERE dataset = 1 AND roll = '" + roll + "'"
    mycursor.execute(query)
    results = mycursor.fetchall()
    if results:
        return "EXIST"  # User details exist
    else:
        return "NOT_EXIST"  # User details do not exist
    
    
@app.route('/InsertData', methods=['POST'])
def insert_data():
    name = request.form['name']
    roll = request.form['roll']
    batch = request.form['batch']
    query = "INSERT INTO studentsa(name, roll, batch) VALUES (%s, %s, %s)"
    
    values = (name, roll, batch)
    try:
        mycursor = mydb.cursor()
        mycursor.execute(query, values)
        mydb.commit()
        return "Data inserted successfully."
    except Exception as e:
        return f"Error inserting data: {e}"



@app.route('/RegisterFace', methods=['POST'])
def RegisterFace():
    with open('models/user_faces.json', 'r') as f:
     user_faces = json.load(f)

    frame_data = request.form['frame']
    roll = request.form["roll"] 
    
    allcounts = getCount(roll)
    ccount = allcounts["ccount"]
    rcount = allcounts["rcount"]
    lcount = allcounts["lcount"]
    allframe = allcounts["frames"]
    c = ccount+lcount+rcount
   
    confidence_threshold = 0.45
    # Decode the base64-encoded frame data
    try:
      frame_bytes = base64.b64decode(frame_data.split(',')[1])
    except:
        return "SOMETHING WENT WRONG"
    
    # Convert the frame bytes to a NumPy array
    frame_array = np.frombuffer(frame_bytes, dtype=np.uint8)
    
    # Decode the frame array as an image
    img = cv2.imdecode(frame_array, flags=cv2.IMREAD_COLOR)
    frame = img
    ##############GOT CV2 FRAME###################
    
    if face_extractor(frame) is not None:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
        # Detect faces in the grayscale frame
            faces = detector(gray)

            if face_extractor(frame) is None:
                return "INVALID-FRAME"
        
    
            for face in faces:
               
                landmarks = predictor(gray, face)

                # Extract the coordinates of specific facial landmarks
                left_eye = (landmarks.part(36).x, landmarks.part(36).y)
                right_eye = (landmarks.part(45).x, landmarks.part(45).y)
                nose_tip = (landmarks.part(30).x, landmarks.part(30).y)
              
                # Calculate the slope of the line passing through the eyes
                eye_slope = (right_eye[1] - left_eye[1]) / (right_eye[0] - left_eye[0])

                # Calculate the slope of the line passing through the eyes and nose tip
                try:
                     nose_slope = (nose_tip[1] - ((left_eye[1] + right_eye[1]) / 2)) / (nose_tip[0] - ((left_eye[0] + right_eye[0]) / 2))
                except ZeroDivisionError:
                     nose_slope = float('inf')
                cv2.putText(frame, str(nose_slope), (100, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
              #  cv2.putText(frame, str(eye_slope), (120,120), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

                if -1.40 <= nose_slope <= -1.10 and lcount<2:
                    # Face is tilted to the left

                    myimg = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    if len(face_recognition.face_encodings(myimg))==0:
                         
                         return "MULTIPLE FACES"

                    cv2.putText(frame, "Left", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    
                    lcount+=1
                    c+=1
                    return updateCounts(ccount,lcount,rcount,roll,allframe,frame)
                    return str(c)
                    


                elif 1.20 <= nose_slope <= 1.5 and rcount<2:
                    # Face is tilted to the right
                    myimg = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    if len(face_recognition.face_encodings(myimg))==0:
                         return "MULTIPLE FACES"
                    cv2.putText(frame, "Right", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                   
                    rcount+=1
                    c+=1
                    return updateCounts(ccount,lcount,rcount,roll,allframe,frame)
                    return str(c)
                elif ccount<2:
                    myimg = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    if len(face_recognition.face_encodings(myimg))==0:
                         return "MULTIPLE FACES"
                    cv2.putText(frame, "Straight", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                    ccount+=1
                    c+=1
                    return updateCounts(ccount,lcount,rcount,roll,allframe,frame)
                    return str(c)

                if c>=6:
                    #save images to user_faces
                    #dont forget to delete that json file
                    UpdateFaceSql(roll)
                    addUserFaces(str(roll))
                    
                    deleteJSON(str(roll))
                    return "FACE_DETECTION_COMPLETED"


    return showcount(ccount,lcount,rcount)
    #############END####################





if __name__ == '_main_':
    app.run()