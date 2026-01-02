// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'pragraphSlice',
//   standalone: true
// })
// export class PragraphSlicePipe implements PipeTransform {

//   transform(value: unknown, ...args: unknown[]): unknown {
//     return null;
//   }

// }
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pragraphSlice'
})
// export class PragraphSlicePipe implements PipeTransform {
//   transform(value: string, length: number): string {
//      
//     let result=null
//     if(value){
//       result = value.split(" ").filter((word,i)=>i<length).join(" ");
//       if(result.length<=length)
//       {
//         return result;
//       }
//       else
//       {
//         result = value.split(" ").filter((word,i)=>i<length).join(" ") + ' ...';
//       }
//     }  
//       return  result;
//   }
export class PragraphSlicePipe implements PipeTransform {
  transform(value: string, wordCount: number): string {
    if (!value) {
      return ''; 
    }
    const words = value.split(" ");

    if (words.length <= wordCount) {
      return value;
    }
    return words.slice(0, wordCount).join(" ") + " ...";
  }


}
