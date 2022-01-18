import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface FlickrPhoto {
  farm: string;
  id: string;
  secret: string;
  server: string;
  title: string;
}

export interface FlickrOutput {
  photos: {
    photo: FlickrPhoto[];
  };
}

export interface FlickrOutputUser {
  user: {
    nsid: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FlickrService {
  prevKeyword: string;
  currPage = 1;

  constructor(private http: HttpClient) { }

  search_keyword(keyword: string) {
    if (this.prevKeyword === keyword) {
      this.currPage++;
    } else {
      this.currPage = 1;
    }
    this.prevKeyword = keyword;
    const url = 'https://www.flickr.com/services/rest/?method=flickr.photos.search&';
    const params = `api_key=${environment.flickr.key}&text=${keyword}&format=json&nojsoncallback=1&per_page=12&page=${this.currPage}`;

    return this.http.get(url + params).pipe(map((res: FlickrOutput) => {
      const urlArr = [];
      res.photos.photo.forEach((ph: FlickrPhoto) => {
        const photoObj = {
          url: `https://farm${ph.farm}.staticflickr.com/${ph.server}/${ph.id}_${ph.secret}`,
          title: ph.title
        };
        urlArr.push(photoObj);
      });
      return urlArr;
    }));
  }

  search_userId(username: string) {
    const user_url = 'https://www.flickr.com/services/rest/?method=flickr.people.findByUsername&';
    const user_params = `api_key=${environment.flickr.key}&username=${username}&format=json&nojsoncallback=1`;

    return this.http.get(user_url + user_params).pipe(map((res: FlickrOutputUser) => {
      return this.search_username(res.user.nsid);
    }));
  }

  search_username(user_id: string) {
    if (this.prevKeyword === user_id) {
      this.currPage++;
    } else {
      this.currPage = 1;
    }
    this.prevKeyword = user_id;

    const photos_url = 'https://www.flickr.com/services/rest/?method=flickr.people.getPublicPhotos&';
    const photos_params = `api_key=${environment.flickr.key}&user_id=${user_id}&format=json&nojsoncallback=1`;

    return this.http.get(photos_url + photos_params).pipe(map((res: FlickrOutput) => {
      const urlArr = [];
      res.photos.photo.forEach((ph: FlickrPhoto) => {
        const photoObj = {
          url: `https://farm${ph.farm}.staticflickr.com/${ph.server}/${ph.id}_${ph.secret}`,
          title: ph.title
        };
        urlArr.push(photoObj);
      });
      return urlArr;
    }));
  }
}
