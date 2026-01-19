const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'
    : 'http://localhost:3001/api';

export const CustomerService = {
    async getCustomersMedium() {
        try {
            const response = await fetch(`${API_URL}/customers`);
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching customers:', error);
            // Fallback to mock data if API fails
            return this.getMockCustomers();
        }
    },

    getMockCustomers() {
        return [
            {
                id: 1000,
                name: 'James Butt',
                country: {
                    name: 'Algeria',
                    code: 'dz'
                },
                company: 'Benton, John B Jr',
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                }
            },
            {
                id: 1001,
                name: 'Josephine Darakjy',
                country: {
                    name: 'Egypt',
                    code: 'eg'
                },
                company: 'Chanay, Jeffrey A Esq',
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                }
            },
            {
                id: 1002,
                name: 'Art Venere',
                country: {
                    name: 'Panama',
                    code: 'pa'
                },
                company: 'Chemel, James L Cpa',
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                }
            },
            {
                id: 1003,
                name: 'Lenna Paprocki',
                country: {
                    name: 'Slovenia',
                    code: 'si'
                },
                company: 'Feltz Printing Service',
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                }
            },
            {
                id: 1004,
                name: 'Donette Foller',
                country: {
                    name: 'South Africa',
                    code: 'za'
                },
                company: 'Printing Dimensions',
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                }
            },
            {
                id: 1005,
                name: 'Simona Morasca',
                country: {
                    name: 'Egypt',
                    code: 'eg'
                },
                company: 'Chapman, Ross E Esq',
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                }
            },
            {
                id: 1006,
                name: 'Mitsue Tollner',
                country: {
                    name: 'Paraguay',
                    code: 'py'
                },
                company: 'Morlong Associates',
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                }
            },
            {
                id: 1007,
                name: 'Leota Dilliard',
                country: {
                    name: 'Serbia',
                    code: 'rs'
                },
                company: 'Commercial Press',
                representative: {
                    name: 'Stephen Shaw',
                    image: 'stephenshaw.png'
                }
            },
            {
                id: 1008,
                name: 'Sage Wieser',
                country: {
                    name: 'Egypt',
                    code: 'eg'
                },
                company: 'Truhlar And Truhlar Attys',
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                }
            },
            {
                id: 1009,
                name: 'Kris Marrier',
                country: {
                    name: 'Mexico',
                    code: 'mx'
                },
                company: 'King, Christopher A Esq',
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                }
            },
            {
                id: 1010,
                name: 'Minna Amigon',
                country: {
                    name: 'Romania',
                    code: 'ro'
                },
                company: 'Dorl, James J Esq',
                representative: {
                    name: 'Anna Fali',
                    image: 'annafali.png'
                }
            },
            {
                id: 1011,
                name: 'Abel Maclead',
                country: {
                    name: 'Singapore',
                    code: 'sg'
                },
                company: 'Rangoni Of Florence',
                representative: {
                    name: 'Bernardo Dominic',
                    image: 'bernardodominic.png'
                }
            },
            {
                id: 1012,
                name: 'Kiley Caldarera',
                country: {
                    name: 'Serbia',
                    code: 'rs'
                },
                company: 'Feiner Bros',
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                }
            },
            {
                id: 1013,
                name: 'Graciela Ruta',
                country: {
                    name: 'Chile',
                    code: 'cl'
                },
                company: 'Buckley Miller & Wright',
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                }
            },
            {
                id: 1014,
                name: 'Cammy Albares',
                country: {
                    name: 'Philippines',
                    code: 'ph'
                },
                company: 'Rousseaux, Michael Esq',
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                }
            },
            {
                id: 1015,
                name: 'Mattie Poquette',
                country: {
                    name: 'Venezuela',
                    code: 've'
                },
                company: 'Century Communications',
                representative: {
                    name: 'Anna Fali',
                    image: 'annafali.png'
                }
            },
            {
                id: 1016,
                name: 'Meaghan Garufi',
                country: {
                    name: 'Malaysia',
                    code: 'my'
                },
                company: 'Bolton, Wilbur Esq',
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                }
            },
            {
                id: 1017,
                name: 'Gladys Rim',
                country: {
                    name: 'Netherlands',
                    code: 'nl'
                },
                company: 'T M Byxbee Company Pc',
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                }
            },
            {
                id: 1018,
                name: 'Yuki Whobrey',
                country: {
                    name: 'Israel',
                    code: 'il'
                },
                company: 'Farmers Insurance Group',
                representative: {
                    name: 'Bernardo Dominic',
                    image: 'bernardodominic.png'
                }
            },
            {
                id: 1019,
                name: 'Fletcher Flosi',
                country: {
                    name: 'Argentina',
                    code: 'ar'
                },
                company: 'Post Box Services Plus',
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                }
            }
        ];
    }
};
