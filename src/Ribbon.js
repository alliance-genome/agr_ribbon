import React, {Component} from 'react'
import PropTypes from 'prop-types';

import axios from 'axios';

import Strip from './view/Strip';
import AssociationsView from './view/AssociationsView';

export default class Ribbon extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentTermId: undefined,
            fetching: false
        }
    }

    handleSlimSelect = (termId) => {
        if (termId !== this.state.currentTermId) {
            this.setState({
                currentTermId: termId
            });
        }
        else {
            this.setState({
                currentTermId: undefined
            })
        }
    };


    componentDidMount() {
        this.fetchSubject(this.props.subject, this.props.title)
    }


    fetchSubject = (subject, title) => {
        let self = this;
        if (subject.startsWith('HGNC:')) {
            axios.get('http://mygene.info/v3/query?q=HGNC%3A31428&fields=uniprot')
                .then(function (results) {
                    let result = results.data.hits[0].uniprot['Swiss-Prot'];
                    self.setState({
                        fetching: false,
                        title: title,
                        subject: 'UniProtKB:' + result,
                    })
                }).catch(function (error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                    console.log('Unable to get data for ' + subject + ' because ' + error.status);
                } else if (error.request) {
                    console.log(error.request);
                    console.log('Unable to get data for ' + subject + ' because ' + error.request);
                } else {
                    console.log(error.message);
                    console.log('Unable to get data for ' + subject + ' because ' + error.message);
                }
                self.setState({
                    fetching: false,
                    title: title,
                    subject: undefined
                });
            })
        }
        else {
            this.setState({
                fetching: false,
                title: title,
                subject: subject,
            })
        }
    };

    render() {
        const slimlist = this.props.slimlist;
        return (
            <div className="ontology-ribbon">
                <Strip
                    currentTermId={this.state.currentTermId}
                    onSlimSelect={(termId) => this.handleSlimSelect(termId)}
                    slimlist={slimlist}
                />
                <div className='ontology-ribbon__caption'>
                    {!this.state.fetching && this.state.subject && this.state.title &&
                    <a href={`http://amigo.geneontology.org/amigo/gene_product/` + this.state.subject}>
                        {this.state.title}
                    </a>
                    }
                    {!this.state.fetching && !this.state.subject && this.state.title &&
                    // no subject, so just provide a linkless title
                    <div>{this.state.title}</div>
                    }
                </div>
                <AssociationsView
                    currentTermId={this.state.currentTermId}
                    slimlist={slimlist}
                    geneUrlFormatter={this.props.geneUrlFormatter}
                />
            </div>
        );
    }
}


Ribbon.propTypes = {
    geneUrlFormatter: PropTypes.func.isRequired,
    title: PropTypes.string,
    slimlist: PropTypes.array.isRequired,
    initialTermId: PropTypes.string,
    subject: PropTypes.string,
};
