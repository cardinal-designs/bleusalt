(function () {
    const UNITS = {
        metric: 'cm',
        us: 'in',
    }
    const MEASUREMENTS = {
        // common
        // 'height': {
        //     label: 'Height',
        //     unit: true,
        // },
        'hips': {
            label: 'Hips',
            unit: true,
        },
        'waist': {
            label: 'Waist',
            unit: true,
        },
        'upper_body': {
            label: 'Upper Body',
            unit: true,
        },
        'inseam': {
            label: 'Inseam',
            unit: true,
        },
        // 'outseam': {
        //     label: 'Outseam',
        //     unit: true,
        // },
        // 'arm': {
        //     label: 'Arm',
        //     unit: true,
        // },
        'arm': {
            label: 'Sleeve',
            unit: true,
        },

        // female
        'bust': {
            label: 'Bust',
            unit: true,
        },
        'cup': {
            label: 'Cup',
        },

        // male
        'neck': {
            label: 'Neck',
            unit: true,
        },
        'chest': {
            label: 'Chest',
            unit: true,
        },
    }
    const FIT_TEXTS = {
        nofit: 'No Fit'
    }
    function waitForEl(selector, callback) {
        if (document.querySelector(selector)) {
            callback(document.querySelector(selector));
        } else {
            setTimeout(function () {
                waitForEl(selector, callback);
            }, 100);
        }
    }
    const BACKEND_ENDPOINT = 'https://sleepy-everglades-12628.herokuapp.com'
    document.addEventListener('alpine:init', () => {
        const url_search_params = new URLSearchParams(location.search)
        if (url_search_params.has('realift_session'))
            localStorage.setItem('realift:session', url_search_params.get('realift_session'))
        Alpine.data('realift', () => ({
            UNITS,
            MEASUREMENTS,
            FIT_TEXTS,

            MEASUREMENTS_KEYS: Object.keys(MEASUREMENTS),

            id: localStorage.getItem('realift:session'),
            get isOnEditor() {
                return !!this.$refs.app.parentElement.dataset.shopifyEditorBlock
            },
            // id: undefined,
            url: localStorage.getItem('realift:url'),
            unit: localStorage.getItem('realift:unit') || 'in',

            available: false,

            status: 'LOADING',
            interval: null,
            measurements: {},
            recommendations: {},
            get hasRecommendations() {
                return !!Object.keys(this.recommendations).length
            },
            settings: {},
            open: url_search_params.has('realift_session'),
            loading: false,
            get actionText() {
                return Object.keys(this.measurements).length ? this.settings.button_text_see_measurements : this.settings.button_text_get_measurements;
            },
            get isMobile() {
                return (function (a) { return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)) })(navigator.userAgent || navigator.vendor || window.opera);
                if (navigator.userAgentData?.mobile)
                    return true

                const ua = navigator.userAgent;
                if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                    return true;
                }
                else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
                    return true;
                }
                return false;
            },
            get qrCode() {
                const url = new URL('https://chart.googleapis.com/chart')
                url.searchParams.set('cht', 'qr')
                url.searchParams.set('chs', '250x250')
                url.searchParams.set('choe', 'UTF-8')
                url.searchParams.set('chl', this.url)
                return url.toString()
            },
            changeUnit() {
                this.unit = this.unit === 'cm' ? 'in' : 'cm';
                localStorage.setItem('realift:unit', this.unit)
            },
            valueOnUnit(value, unit) {
                if (!value) return value
                if (unit === 'cm')
                    return parseFloat(value.toFixed(1))
                else
                    return parseFloat((value * 0.39370).toFixed(1)) + '"'
            },
            fetch() {
                this.loading = true
                fetch(
                    BACKEND_ENDPOINT + `/api/session/${this.id}?product=${this.$refs.app.dataset.product}&variant=${this.$refs.app.dataset.variant}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                ).then(response => response.json()).then(
                    ({ success, payload }) => {
                        this.loading = false
                        const isChanged = this.status != 'LOADING' && this.status != payload.status
                        this.status = payload.status
                        if(isChanged && payload.measurements) {
                          this.updateCartAttributes()
                        }
                        if (success) {
                            switch (payload.status) {
                                case 'INITIALIZED':
                                case 'IN_USE':
                                    this.startSync()
                                    break
                                case 'MEASUREMENTS_SENT':
                                    this.measurements = payload.measurements
                                    this.recommendations = payload.recommendations || {}
                                // this.open = true
                                case 'APP_CLOSED':
                                    clearInterval(this.interval)
                                    this.interval = null
                                    break
                            }
                            if (payload.measurements) {
                                this.measurements = payload.measurements
                                this.recommendations = payload.recommendations || {}
                                this.status = 'MEASUREMENTS_SENT'
                                localStorage.setItem("realift:hasMeasurements", "true");
                                if (!payload.recommendations && this.realfitAvailable) {
                                    waitForEl(
                                        '#PopupModal-sizing-guide',
                                        el => {
                                            fetch(
                                                BACKEND_ENDPOINT + `/api/session/${this.id}/recommendations?product=${this.$refs.app.dataset.product}&variant=${this.$refs.app.dataset.variant}&url=${location.href}`,
                                                {
                                                    method: 'post',
                                                    body: JSON.stringify({
                                                        html: el.outerHTML,
                                                        collections_titles: this.collections_titles,
                                                    }),
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    }
                                                }
                                            ).then(response => response.json()).then(({ payload }) => {
                                                if(payload)
                                                  this.recommendations = payload
                                                this.updateCartAttributes()
                                            })
                                        }
                                    )

                                }
                            }
                        }
                    }
                )
            },
            startSync() {
                if (!this.interval)
                    this.interval = setInterval(this.fetch.bind(this), 1000 * 5)
            },
            hasAccess(config) {
                if (config.rule == 'none')
                    return false
                if (config.rule == 'all')
                    return true
                if (config.rule == 'include')
                    return config.collections.some(collection => this.collections.includes(collection))
                if (config.rule == 'exclude')
                    return !config.collections.some(collection => this.collections.includes(collection))
            },
            init() {
                this.settings = JSON.parse(this.$refs.app.dataset.settings)
                this.collections = JSON.parse(this.$refs.app.dataset.collections)
                this.collections_titles = JSON.parse(this.$refs.app.dataset.collectionsTitles)
                this.config = JSON.parse(this.$refs.app.dataset.config)

                this.available = this.hasAccess(this.config)
                this.realfitAvailable = this.hasAccess(this.config.realfit)

                this.unit = UNITS[this.settings.results_unit] || this.unit
                if (this.isOnEditor) {
                    this.available = true
                    this.realfitAvailable = true
                    this.status = 'MEASUREMENTS_SENT'
                    this.measurements = {
                        "dress": 1,
                        "gender": "Female",
                        "hips": 89,
                        "weight": 56,
                        "bust": 81,
                        "waist": 61,
                        "shoe": 8.5,
                        "age": 29,
                        "height": 178,
                        "cup": "B"
                    }
                    this.recommendations = {
                        "slim": "L",
                        "relaxed": "L",
                        "baggy": "XL"
                    }
                    this.open = !true
                } else if (this.id && this.available)
                    this.fetch()
                else
                    this.status = 'UNINITIALIZED'

                this.$refs.app.hidden = !(this.available || this.realfitAvailable)
            },
            initiate(redo) {
                if (!redo && (this.id || this.isOnEditor)) {
                    if (this.isMobile && !Object.keys(this.measurements).length)
                        window.location.replace(this.url);
                    else
                        this.open = !this.open
                } else {
                    this.loading = true
                    fetch(
                        BACKEND_ENDPOINT + '/api/session?shop='+Shopify.shop,
                        {
                            method: 'post',
                            body: JSON.stringify({
                                app: 'REALSIZE',
                                product: this.$refs.app.dataset.product,
                                variant: this.$refs.app.dataset.variant,
                                url: location.href,
                                // html: document.body.innerHTML,
                                // ...this.$refs.app.dataset,
                            }),
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }
                    ).then(response => response.json()).then(
                        ({ success, session, url }) => {
                            this.loading = false
                            localStorage.setItem('realift:session', this.id = session.id)
                            localStorage.setItem('realift:url', this.url = url)
                            this.status = 'INITIALIZED'
                            if(!redo)
                              this.updateCartAttributes()
                            if (success) {
                                // window.open(url, '_blank_realift')
                                this.fetch()
                                if (this.isMobile)
                                    window.location.replace(url);
                                else
                                    this.open = true
                            }
                        }
                    )
                }
            },
            iconUrl(key) {
                const url = new URL('https://realift-svg-generator.oudy.workers.dev')
                url.pathname = `/${key}.svg`
                url.searchParams.set('body-color', this.settings.results_icons_body_color)
                url.searchParams.set('feature-color', this.settings.results_icons_feature_color)
                url.searchParams.set('measurement-color', this.settings.results_measurement_color)
                url.searchParams.set('fill-color', this.settings.button_text_color)
                return url.toString()
            },
            fitText(text) {
                return FIT_TEXTS[text] || text
            },
            updateCartAttributes() {
                const variables = new URLSearchParams()
                const measurementsEntries = Object.entries(this.measurements)
                if(measurementsEntries.length)
                  variables.set(
                    `attributes[ReaLift Measurements (Session: ${this.id})]`,
                    measurementsEntries
                    .filter(([key]) => MEASUREMENTS[key])
                    .map(([key, value]) => [MEASUREMENTS[key].label, MEASUREMENTS[key].unit ? this.valueOnUnit(value, 'in') : value].join(': '))
                    .join('\n')
                  )
                const recommendationsEntries = Object.entries(this.recommendations)
                if(recommendationsEntries.length)
                  variables.set(
                    `attributes[ReaLift Recommendations (Product: ${this.$refs.app.dataset.product}, Session: ${this.id})]`,
                    [
                      [this.settings.realfit_option_text_0, this.fitText(this.recommendations.option_0 || this.recommendations.slim)],
                      [this.settings.realfit_option_text_1, this.fitText(this.recommendations.option_1 || this.recommendations.relaxed)],
                      [this.settings.realfit_option_text_2, this.fitText(this.recommendations.option_2 || this.recommendations.baggy)],
                    ].map(r => r.join(': ')).join('\n')
                  )
              const attributes = variables.toString()
              if(attributes)
                fetch(window.Shopify.routes.root + 'cart/update.js', {method:'POST', body: attributes, headers: {'Content-Type': 'application/x-www-form-urlencoded',}})
                // jQuery.post(window.Shopify.routes.root + 'cart/update.js', attributes)
            }
        }))
    })
    import('https://unpkg.com/alpinejs')
})()