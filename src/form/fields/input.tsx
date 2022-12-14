import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/block-editor';
import {
    PanelBody,
    PanelRow,
    ToggleControl
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import {
    InspectorControls,
    useBlockProps
} from '@wordpress/block-editor';
import { button } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import iconMetadata from '../../icon/block.json';
import parse from "html-react-parser";

const toKebabCase = string => {
    return string.replaceAll( ' ', '-' ).toLowerCase();
}

export const fields = [
    {
        name: '[]meta_input',
        type: 'text',
        slug: 'custom',
        label: __( 'Custom', 'blockify' ),
        description: __( 'Displays a custom text input field.', 'blockify' ),
        placeholder: __( 'Placeholder', 'blockify' ),
        icon: button,
    },
    {
        name: 'first_name',
        type: 'text',
        slug: 'first-name',
        label: __( 'First name', 'blockify' ),
        description: __( 'Displays a first name input field.', 'blockify' ),
        placeholder: __( 'First name', 'blockify' ),
        icon: 'admin-users',
    },
    {
        name: 'last_name',
        type: 'text',
        slug: 'last-name',
        label: __( 'Last name', 'blockify' ),
        description: __( 'Displays a last name input field.', 'blockify' ),
        placeholder: __( 'Last name', 'blockify' ),
        icon: 'admin-users',
    },
    {
        name: 'user_email',
        type: 'email',
        slug: 'email',
        label: __( 'Email', 'blockify' ),
        description: __( 'Displays an email input field.', 'blockify' ),
        placeholder: __( 'Email address', 'blockify' ),
        icon: 'email',
        //secondary: __( 'Confirm email', 'blockify' ),
        keywords: [
            __( 'Newsletter', 'blockify' ),
            __( 'Sign up', 'blockify' ),
        ]
    },
    {
        name: 'user_url',
        type: 'url',
        slug: 'url',
        label: __( 'URL', 'blockify' ),
        description: __( 'Displays a website URL input field.', 'blockify' ),
        placeholder: __( 'https://example.com/', 'blockify' ),
        icon: 'admin-links',
        keywords: [
            __( 'Website', 'blockify' ),
            __( 'Link', 'blockify' ),
        ]
    },
    {
        name: 'user_phone',
        type: 'tel',
        slug: 'phone',
        label: __( 'Phone', 'blockify' ),
        description: __( 'Displays a phone number input field.', 'blockify' ),
        placeholder: __( '', 'blockify' ),
        icon: 'phone',
        keywords: [
            __( 'Telephone', 'blockify' ),
            __( 'Call', 'blockify' ),
            __( 'Mobile', 'blockify' ),
            __( 'Number', 'blockify' ),
        ]
    },
    {
        type: 'number',
        slug: 'number',
        label: __( 'Number', 'blockify' ),
        description: __( 'Displays a number input field.', 'blockify' ),
        placeholder: __( '', 'blockify' ),
        icon: 'sort',
    },
    {
        name: 'user_pass',
        type: 'password',
        slug: 'password',
        label: __( 'Password', 'blockify' ),
        description: __( 'Displays a password input field.', 'blockify' ),
        placeholder: __( '', 'blockify' ),
        icon: 'ellipsis',
        //secondary: __( 'Confirm password', 'blockify' ),
        keywords: [
            __( 'User', 'blockify' ),
        ]
    },
    {
        name: 'description',
        type: 'textarea',
        slug: 'text-area',
        label: __( 'Text Area', 'blockify' ),
        description: __( 'Displays a custom text area field.', 'blockify' ),
        placeholder: __( 'Leave a message', 'blockify' ),
        icon: button
    },
];

const defaultKeywords = [
    __( 'Form', 'blockify' ),
    __( 'Input', 'blockify' ),
];

const supports = {
    multiple: false,
    color: {
        gradients: true,
        background: true,
        text: true,
    },
    spacing: {
        margin: true,
        padding: true,
        blockGap: true,
    },
    __experimentalBorder: {
        width: true,
        style: true,
        color: true,
        radius: true,
        __experimentalDefaultControls: {
            width: true,
            color: true
        }
    },
    typography: {
        fontSize: true,
        lineHeight: true,
    },
};

const attributes = {
    styles: {
        type: 'object'
    },
    name: {
        type: 'string',
        default: 'input',
    },
    placeholder: {
        type: 'string',
    },
    secondary: {
        type: 'string',
    },
    label: {
        type: 'string',
    },
    showLabel: {
        type: 'boolean',
        default: false
    },
    showSecondary: {
        type: 'boolean',
        default: false
    },
    showIcon: {
        type: "boolean",
        default: false
    },
    textAlign: {
        type: 'string',
        default: 'none'
    },
    isRequired: {
        type: 'boolean',
        default: false
    },
    icon: {
        type: 'string',
        default: iconMetadata.attributes.svgString.default
    },
    width: {
        type: 'string',
    }
}

const getInputClass = ( blockProps, field ) => {
    let inputClass = blockProps.className;

    inputClass = inputClass.replace( 'wp-block-blockify-' + field.slug, ' ' );
    inputClass = inputClass.replace( ' wp-block ', ' ' );
    inputClass = 'blockify-form-input ' + inputClass.replaceAll( '  ', '' );

    return inputClass;
}

const getInputStyle = blockStyle => {
    let inputStyle = blockStyle;

    delete inputStyle.margin;
    delete inputStyle.marginTop;
    delete inputStyle.marginRight;
    delete inputStyle.marginBottom;
    delete inputStyle.marginLeft;

    return inputStyle;
}

const Edit = ( props, field ) => {
    const {
              attributes,
              setAttributes
          } = props;

    const {
              showLabel,
              showIcon,
              icon,
              isRequired,
              placeholder,
              secondary,
              showSecondary,
              style
          } = attributes;

    const blockProps = {
        ...useBlockProps(),
        'data-showlabel': showLabel,
        'data-showicon': showIcon,
        'data-required': isRequired
    };

    const [ width, setWidth ] = useState( attributes.width );

    let { icons } = useSelect( select => {
        return {
            icons: select( 'blockify/icons' ).getIcons(),
        };
    }, [] );

    setAttributes( {
        icon: icons?.['social']?.['mail']
    } );

    const rows = 'textarea' === field.type ? { rows: 6 } : {};

    return (
        <>
            <InspectorControls key="settings">
                <PanelBody title={ field.label + ' settings' } className={ 'blockify-input-settings' }>
                    <PanelRow>
                        <ToggleControl
                            label={ __( 'Show Label', 'blockify' ) }
                            checked={ showLabel }
                            onChange={ value => {
                                setAttributes( {
                                    showLabel: value
                                } );
                            } }
                        />
                    </PanelRow>
                    { field?.secondary &&
					  <PanelRow>
						  <ToggleControl
							  label={ field.secondary + __( ' field', 'blockify' ) }
							  checked={ showSecondary }
							  onChange={ value => {
                                  setAttributes( {
                                      showSecondary: value
                                  } );
                              } }
						  />
					  </PanelRow>
                    }
                    <PanelRow>
                        <ToggleControl
                            label={ __( 'Show icon', 'blockify' ) }
                            checked={ showIcon }
                            onChange={ value => {
                                setAttributes( {
                                    showIcon: value
                                } );
                            } }
                        />
                    </PanelRow>
                    <PanelRow>
                        <ToggleControl
                            label={ __( 'Required', 'blockify' ) }
                            checked={ isRequired }
                            onChange={ value => {
                                setAttributes( {
                                    isRequired: value
                                } );
                            } }
                        />
                    </PanelRow>
                </PanelBody>
            </InspectorControls>

            <div
                { ...blockProps }
                className={ blockProps.className + ' blockify-form-field' }
                style={ {
                    gap: style?.spacing?.blockGap,
                    marginTop: style?.spacing?.margin?.top,
                    marginRight: style?.spacing?.margin?.right,
                    marginBottom: style?.spacing?.margin?.bottom,
                    marginLeft: style?.spacing?.margin?.left,
                    width: attributes?.width
                } }
            >
                { showLabel &&
				  <RichText
					  tagName={ 'label' }
					  className={ 'blockify-form-label' }
					  htmlFor={ field.name }
					  value={ ( attributes.label ?? field.label ) + ( attributes.isRequired ? '*' : '' ) }
					  onChange={ value => setAttributes( {
                          label: value
                      } ) }
				  />
                }
                { showIcon && parse( icon ) }
                <RichText
                    { ...blockProps }
                    className={ 'blockify-form-input wp-block-blockify-' + field.label.toLowerCase() }
                    tagName={ 'span' }
                    type={ field.type }
                    name={ field.name }
                    style={ getInputStyle( blockProps.style ) }
                    placeholder={ placeholder }
                    multiline={ 'textarea' === field.type }
                    allowedFormats={ [
                        'blockify/uppercase',
                        'core/bold',
                        'core/italic'
                    ] }
                    value={ placeholder ?? field.placeholder }
                    onChange={ value => setAttributes( {
                        placeholder: value
                    } ) }
                    { ...rows }
                />
                { ( field?.secondary && showSecondary ) &&
				  <RichText
					  className={ getInputClass( blockProps, field ) }
					  tagName={ 'span' }
					  placeholder={ secondary ?? field.secondary }
					  name={ toKebabCase( field.secondary ) }
					  style={ getInputStyle( blockProps.style ) }
					  allowedFormats={ [
                          'blockify/uppercase',
                          'core/bold',
                          'core/italic'
                      ] }
					  onChange={ value => setAttributes( {
                          secondary: value
                      } ) }
				  />
                }
            </div>
        </>
    );
};

const Save = ( props, field ) => {
    const { attributes } = props;
    const {
              showLabel,
              icon,
              showIcon,
              isRequired,
              secondary,
              showSecondary,
              placeholder,
              style
          }              = attributes;

    let blockProps = {
        ...useBlockProps.save(),
        'data-showlabel': showLabel,
        'data-required': isRequired,
        tagName: 'textarea' === field.type ? 'textarea' : 'input',
        type: field.type,
        name: field?.label,
        placeholder: placeholder.replace( /<\/?[^>]+(>|$)/g, "" ),
    };

    if ( attributes?.minHeight ) {
        blockProps.style = {
            ...blockProps.style,
            minHeight: attributes.minHeight
        };
    }

    return (
        <>
            <div
                className={ 'blockify-form-field' }
                style={ {
                    gap: style?.spacing?.blockGap,
                    marginTop: style?.spacing?.margin?.top,
                    marginRight: style?.spacing?.margin?.right,
                    marginBottom: style?.spacing?.margin?.bottom,
                    marginLeft: style?.spacing?.margin?.left,
                    width: attributes?.width
                } }
            >
                { attributes?.showLabel &&
				  <RichText.Content
					  tagName={ 'label' }
					  className={ 'blockify-form-label' }
					  htmlFor={ field.name }
					  value={ ( attributes.label ?? field.label ) + ( attributes.isRequired ? '*' : '' ) }
				  />
                }
                { showIcon && parse( icon ) }
                <RichText.Content
                    { ...blockProps }
                    tagName={ 'textarea' === field?.type ? 'textarea' : 'input' }
                    className={ 'blockify-form-input wp-block-blockify-' + field.slug }
                    style={ getInputStyle( blockProps.style ) }
                    name={ field.name }
                />
                { ( field?.secondary && showSecondary ) &&
				  <RichText.Content
                      { ...blockProps }
					  className={ getInputClass( blockProps, field ) }
					  name={ toKebabCase( field.secondary ) }
					  placeholder={ secondary ?? field.secondary }
					  style={ getInputStyle( blockProps.style ) }
				  />
                }
            </div>
        </>
    );
};

fields.forEach( field => {
    return (
        registerBlockType( 'blockify/' + field.slug, {
            apiVersion: 2,
            title: field.label,
            description: field.description,
            icon: field.icon,
            category: 'blockify-form',
            parent: [ 'blockify/form', 'core/columns', 'core/column', 'core/paragraph' ],
            keywords: field?.keywords ? [
                ...defaultKeywords,
                ...field.keywords
            ] : defaultKeywords,
            supports: supports,
            attributes: {
                ...attributes,
                placeholder: { default: field.placeholder }
            },
            edit: props => Edit( props, field ),
            save: props => Save( props, field )
        } )
    )
} );
