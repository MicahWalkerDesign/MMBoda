Project: Glassmorphic Wedding Photo UploaderTech Stack: Next.js (Static Export), Tailwind CSS, Google Apps Script (Backend)

Frontend Requirements:



Framework: Next.js using the App Router. Must be configured for static export (output: 'export') for GitHub Pages compatibility.

UI Style (Glassmorphism):

Use Tailwind CSS for styling.

Containers should have: bg-white/10, backdrop-blur-md, border border-white/20, and shadow-xl.

Background should be a soft, elegant gradient (e.g., bg-gradient-to-br from-rose-100 to-teal-100) to make the glass effect pop.

Component Logic:

A "Dropzone" or File Input component that handles multiple images.

Convert images to Base64 strings using FileReader.

Use fetch to POST the data to the Google Apps Script Web App URL.

State Management: Show a "Glassy" loading spinner and a success toast after the upload.

Backend (Google Apps Script):



Create a doPost(e) function to receive JSON/Base64 data.

Authenticate the script as "Me" and set access to "Anyone."

Store files in a specific Google Drive folder and return a JSON success/fail response.

CORS Handling: Ensure the script returns a TextOutput with the correct JSON formatting so the Next.js frontend doesn't trigger a CORS block.

UI Implementation (Tailwind Example)

To get that glass effect in your layout.tsx or page.tsx, you can use this CSS pattern:



HTML



<div className="relative group p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl transition-all hover:bg-white/30">

  <h2 className="text-2xl font-light text-white mb-4">Upload to the Gallery</h2>

  <input type="file" className="block w-full text-sm text-slate-500

    file:mr-4 file:py-2 file:px-4

    file:rounded-full file:border-0

    file:text-sm file:font-semibold

    file:bg-white/50 file:text-rose-700

    hover:file:bg-white/80" /></div>

Important Note for Next.js on GitHub Pages:

Since GitHub Pages doesn't support the Next.js Image Optimization feature natively (it requires a Node.js server), you’ll need to add this to your next.config.js:



JavaScript



const nextConfig = {

  output: 'export',

  images: {

    unoptimized: true,

  },

}



Building a Next.js wedding app with a glassmorphism style is a fantastic way to lean into your design background. To get the photo-upload "engine" running, you'll need the following Google Apps Script.



1. The Google Apps Script (The "Backend")

Create a new script at script.google.com, paste this in, and replace 'YOUR_FOLDER_ID_HERE' with the ID of the Google Drive folder where you want the wedding photos to go.



JavaScript



/**

 * GOOGLE APPS SCRIPT: Wedding Photo Bridge

 * Allows anonymous uploads from your Next.js frontend to Google Drive.

 */const FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // Replace with your Drive folder IDfunction doPost(e) {

  try {

    // 1. Parse incoming data (sent as text/plain to bypass preflight CORS)

    const data = JSON.parse(e.postData.contents);

    const base64Data = data.file.split(',')[1]; // Remove data:image/png;base64, prefix

    const fileName = data.filename || `wedding_photo_${Date.now()}.jpg`;

    const mimeType = data.filetype || "image/jpeg";



    // 2. Convert Base64 string back to a Blob

    const decodedData = Utilities.base64Decode(base64Data);

    const blob = Utilities.newBlob(decodedData, mimeType, fileName);



    // 3. Save to the specific Wedding Folder

    const folder = DriveApp.getFolderById(FOLDER_ID);

    const file = folder.createFile(blob);



    // 4. Return Success Response

    return ContentService.createTextOutput(JSON.stringify({ 

      status: "success", 

      url: file.getUrl() 

    })).setMimeType(ContentService.MimeType.JSON);



  } catch (error) {

    return ContentService.createTextOutput(JSON.stringify({ 

      status: "error", 

      message: error.toString() 

    })).setMimeType(ContentService.MimeType.JSON);

  }

}// Essential for bypasssing CORS "Pre-flight" issuesfunction doOptions(e) {

  return ContentService.createTextOutput("")

    .setMimeType(ContentService.MimeType.TEXT);

}

How to Deploy:

Click Deploy > New Deployment.

Select Web App.

Execute as: Me (your email).

Who has access: Anyone (this allows guests to upload without logging in).

Copy the Web App URL—you’ll need this for your Next.js fetch call.

2. The Glassmorphism CSS (Tailwind)

Since you're using Next.js and Tailwind, you can create a "Glass Card" component for the upload form. This look relies on backdrop-blur and a thin, semi-transparent border.

Tailwind Config/Classes:



TypeScript



const GlassCard = ({ children }) => (

  <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl ring-1 ring-black/5">

    {children}

  </div>

);

3. The Frontend Fetch Logic (Next.js)

To avoid CORS errors, the key trick is to send the data as text/plain. Google Apps Script doesn't handle application/json pre-flight requests well, but it can parse the text body just fine.



JavaScript



const uploadPhoto = async (base64File, fileName, fileType) => {

  const SCRIPT_URL = "YOUR_DEPLOYED_WEB_APP_URL";

  

  const response = await fetch(SCRIPT_URL, {

    method: "POST",

    mode: "no-cors", // Crucial for static GitHub Pages to GAS communication

    headers: {

      "Content-Type": "text/plain;charset=utf-8",

    },

    body: JSON.stringify({

      file: base64File,

      filename: fileName,

      filetype: fileType

    }),

  });



  // Note: with "no-cors", you won't be able to read the response body,

  // but the file will successfully land in your Google Drive!

};





