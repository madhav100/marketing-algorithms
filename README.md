# marketing-algorithms

## SFRA architecture starter

This repository now includes a minimal Salesforce Commerce Cloud (SFRA) storefront cartridge
structure to serve as a foundation for development.

### Layout

```
cartridges/
  app_storefront_base/
    cartridge/
      config/
        cartridge.properties
      controllers/
        Home.js
        Contact.js
      client/
        default/
          js/
          scss/
      experience/
        components/
      forms/
        default/
          contact.xml
      models/
        contactForm.js
        pageMetaData.js
      scripts/
        helpers/
          validationHelpers.js
        middleware/
          pageMetaData.js
      static/
        default/
      templates/
        default/
          common/
            layout/
              page.isml
          home/
            home.isml
```

### Usage

* Add `app_storefront_base` to your cartridge path in Business Manager.
* Navigate to `Home-Show` to verify the storefront renders.

### Next steps

* Extend the `pageMetaData` model to include canonical URLs and SEO tags.
* Add additional controllers, templates, and scripts as the storefront grows.
* Introduce client-side assets, pipelines, and integration cartridges as needed.
