import { Component } from '@angular/core';
import { Camera, CameraOptions,PictureSourceType  } from '@ionic-native/camera/ngx';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
const STORAGE_KEY = 'my_images';
import { ActionSheetController, ToastController, Platform, LoadingController,NavParams} from '@ionic/angular';
import { fillProperties } from '@angular/core/src/util/property';
import { async } from 'q';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss']
})
export class AboutPage {
  private images: string;
  private path: string; 
  constructor(private camera: Camera
,private file: File, private http: HttpClient,private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private storage: Storage, private plt: Platform, private loadingController: LoadingController,){
      this.images="";
      this.path = "";

  }
  ngOnInit() {
  
  }
  async presentToast(toastString) {
    const toast = await this.toastController.create({
      message:toastString,
      duration: 2000
    });
    toast.present();
  }

  async onCapture(){
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
              text: 'Load from Library',
              handler: () => {
                  this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
              }
          },
          {
              text: 'Use Camera',
              handler: () => {
                  this.takePicture(this.camera.PictureSourceType.CAMERA);
              }
          },
          {
              text: 'Cancel',
              role: 'cancel'
          }
      ]
  });
  await actionSheet.present();
  }
  takePicture(sourceType: PictureSourceType) {
    var options: CameraOptions = {
        quality: 100,
        sourceType: sourceType,
        saveToPhotoAlbum: false,
        correctOrientation: true,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
    };
 
    this.camera.getPicture(options).then(imagePath => {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);

        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
        this.images= imagePath;
        this.path =imagePath;

    });
}
public pathForImage(img) {
  if (img === null) {
    return '';
  } else {
    return this.file.dataDirectory + img;
  }
}

createFileName() {
  var d = new Date(),
      n = d.getTime(),
      newFileName = n + ".jpg";
  return newFileName;
}
copyFileToLocalDir(namePath, currentName, newFileName) {
  this.file.copyFile(namePath, currentName, this.file.dataDirectory, newFileName).then(success => {
      this.updateStoredImages(newFileName);
     
  }, error => {
      // this.presentToast('Error while storing file.');
  });
}
updateStoredImages(name) {
  
  this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
          let newImages = [name];
          this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
          arr.push(name);
          this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.file.dataDirectory + name;

      let resPath = this.pathForImage(filePath);
      let newEntry = {
          name: name,
          path: resPath,
          filePath: filePath
      };

      // this.images=filePath;
      // this.images = [newEntry, ...this.images];
      console.log(this.images);
     
      // this.ref.detectChanges(); // trigger change detection cycle
  });
}
}
