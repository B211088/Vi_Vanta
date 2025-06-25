import { GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import workerURL from "pdfjs-dist/legacy/build/pdf.worker?url";

GlobalWorkerOptions.workerSrc = workerURL;
