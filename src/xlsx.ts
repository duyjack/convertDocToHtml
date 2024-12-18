import * as xlsx from 'xlsx';
import { PrefixId } from './enum';
import BaseOffice from './base/office';

export class SettingXlsx {
    #smallInputSize: number = 20;
    #mediumInputSize: number = 30;
    #largeInputSize: number = 75;

    #containsTextSmallInput: string[] = [];
    #containsTextMediumInput: string[] = [];
    #containsTextLargeInput: string[] = [];

    get smallInputSize(): number {
        return this.#smallInputSize;
    }

    get mediumInputSize(): number {
        return this.#mediumInputSize;
    }

    get largeInputSize(): number {
        return this.#largeInputSize;
    }


    ///
    get containsTextSmallInput(): string[] {
        return this.#containsTextSmallInput;
    }

    get containsTextMediumInput(): string[] {
        return this.#containsTextMediumInput;
    }

    get containsTextLargeInput(): string[] {
        return this.#containsTextLargeInput;
    }


    config(options: {
        smallInputSize?: number,
        mediumInputSize?: number,
        largeInputSize?: number,

        containsTextSmallInput?: string[],
        containsTextMediumInput?: string[],
        containsTextLargeInput?: string[],
    }) {
        this.#smallInputSize = options.smallInputSize ?? 20;
        this.#mediumInputSize = options.mediumInputSize ?? 30;
        this.#largeInputSize = options.largeInputSize ?? 30;

        this.#containsTextSmallInput = options?.containsTextSmallInput ?? [];
        this.#containsTextMediumInput = options?.containsTextMediumInput ?? [];
        this.#containsTextLargeInput = options?.containsTextLargeInput ?? [];
    }
}

export default class Xlsx<T> extends BaseOffice<T> {
    
    #setting: SettingXlsx;

    constructor(
        url: string,
        setting: SettingXlsx,
    ) {
        super(url, {} as any)
        this.#setting = setting;
    }

    async convertXlsx2Html(container: HTMLElement) {
        const url = this.url;
        try {
            // Fetch tệp Excel từ URL
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            // Đọc dữ liệu nhị phân
            const arrayBuffer = await response.arrayBuffer();

            // Phân tích dữ liệu Excel bằng SheetJS
            const workbook = xlsx.read(new Uint8Array(arrayBuffer), { type: 'array' });

            // Lấy sheet đầu tiên
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            console.log('cols', firstSheet['!cols']);
            console.log('rows', firstSheet['!cols']);
            // Chuyển đổi sheet thành HTML
            let html = xlsx.utils.sheet_to_html(firstSheet);
            console.log('html', html);

            const textReplaces = html.match(/>{{\s*[\w.]+\s*}}</g);
            console.log('textReplaces', textReplaces);
            for (let text of textReplaces as Array<string>) {
                let width = '10px';
                const key = text.replace('>{{', '').replace('}}<', '');
                this.initKeyWhenNoValue(key);
                if (this.#setting.containsTextSmallInput.some(txt => text.includes(txt))) {
                    width = `${this.#setting.smallInputSize}px`;
                } else if (this.#setting.containsTextMediumInput.some(txt => text.includes(txt))) {
                    width = `${this.#setting.mediumInputSize}px`;
                } else if (this.#setting.containsTextLargeInput.some(txt => text.includes(txt))) {
                    width = `${this.#setting.largeInputSize}px`;
                } else {
                    width = `${this.#setting.mediumInputSize}px`;
                }
                const idElement = this.generateIdElement(key);
                const component = `> <input id=${idElement} type='text' style='width: ${width}'/><`;
                html = html.replace(text, component);
            }

            // Hiển thị HTML
            container.innerHTML = html;
        } catch (error) {
            console.error('Error fetching or processing the file:', error);
            container.innerHTML = `<p style="color:red;">Error: ${JSON.stringify(error)}</p>`;
        }
    }
}